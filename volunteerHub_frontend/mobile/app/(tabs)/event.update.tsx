import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useMemo, useRef, useState } from "react";
import { styles } from "@/src/styles/event.style";
import { toAppError } from "@/src/api/errors";
import { getEventById, updateEvent } from "@/src/api/event.api";
import { EVENT_CATEGORIES, EventCategory } from "@/src/types/event";
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { getPlacesSuggestions, getLatLongFromPlaceId } from "@/src/utils/location.utils";

type FieldErrors = Partial<{
  Title: string;
  Description: string;
  Category: string;
  StartDateTime: string;
  EndDateTime: string;
  LocationName: string;
  Address: string;
  Latitude: string;
  Longitude: string;
  MaxVolunteers: string;
  general: string;
}>;

function formatForWebInput(d: Date) {
  if (!d || isNaN(d.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function parseWebInputToDate(v: string) {
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export default function UpdateEventScreen() {
    const router= useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    const [Title, setTitle] = useState("");
    const [Description, setDescription] = useState("");
    const [Category, setCategory] = useState<EventCategory>(EVENT_CATEGORIES[0].value);
    
    const [StartDateTime, setStartDateTime] = useState<Date>(new Date());
    const [EndDateTime, setEndDateTime] = useState<Date>(new Date(60 * 60 * 1000 + Date.now()));

    const [MaxVolunteers, setMaxVolunteers] = useState("");
    const [status, setStatus] = useState(""); 
    const [Location, setLocation] = useState("");
    const [Address, setAddress] = useState("");
    const [Longitude, setLongitude] = useState("");
    const [Latitude, setLatitude] = useState("");

    const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
    const [showLocationMenu, setShowLocationMenu] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // iOS modal pickers
    const [showStartPickerIOS, setShowStartPickerIOS] = useState(false);
    const [showEndPickerIOS, setShowEndPickerIOS] = useState(false);

    const [CreatedAt, setCreatedAt] = useState("");
    const [CreatedById, setCreatedBy] = useState("");
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [errors, setErrors] = useState<FieldErrors>({});
  

    function clearError(k: keyof FieldErrors) {
     setErrors((p) => ({ ...p, [k]: undefined, general: undefined }));
    }

    const categoryLabel = useMemo(() => {
        const found = EVENT_CATEGORIES.find((c) => c.value === Category);
        return found?.label ?? "";
    }, [Category]);
      
    useFocusEffect(
        useCallback(() => {
        setErrors({});
        setErrorMsg(null);
        }, [])
        );

    useFocusEffect(
    useCallback(() => {
        if (!id) return;

        let mounted = true;

        (async () => {
        try {
            const ev = await getEventById(String(id));
            if (!mounted) return;
            setTitle(ev.title ?? ""); 
            setDescription(ev.description ?? "");
            setCategory(ev.category);

            const sd = new Date(ev.startDateTime);
            const ed = new Date(ev.endDateTime);

            setStartDateTime(isNaN(sd.getTime()) ? new Date() : sd);
            setEndDateTime(isNaN(ed.getTime()) ? new Date(Date.now() + 60 * 60 * 1000) : ed);
            setLocation(ev.locationName ?? "");
            setAddress(ev.address ?? "");

            setLatitude(String(ev.latitude));
            setLongitude(String(ev.longitude));
            setMaxVolunteers(
                ev.maxVolunteers && ev.maxVolunteers > 0
                    ? String(ev.maxVolunteers)
                    : ""
                );
        } catch (e) {
            setErrorMsg("Failed to load event.");
        }
        })();

        return () => {
        mounted = false;
        };
    }, [id])
    );

    function validate(): FieldErrors {
        const e: FieldErrors = {};

        const t = Title.trim();
        const d = Description.trim();
        const ln = Location.trim();
        const a = Address.trim();

        if (!t) e.Title = "Title is required.";
        else if (t.length > 200) e.Title = "Title must be max 200 characters.";

        if (!d) e.Description = "Description is required.";
        else if (d.length > 2000) e.Description = "Description must be max 2000 characters.";

        if (Category === undefined || Category === null) e.Category = "Category is required.";

        if (!StartDateTime || isNaN(StartDateTime.getTime())) e.StartDateTime = "Start date/time is required.";
        if(StartDateTime && StartDateTime.getTime() < Date.now()) e.StartDateTime = "Start date/time cannot be in the past.";
        if (!EndDateTime || isNaN(EndDateTime.getTime())) e.EndDateTime = "End date/time is required.";
        if (StartDateTime && EndDateTime && EndDateTime.getTime() < StartDateTime.getTime()) {
        e.EndDateTime = "End date/time must be after start date/time.";
        }

        if (!ln) e.LocationName = "Location is required.";
        else if (ln.length > 300) e.LocationName = "Location must be max 300 characters.";

        if (!Latitude || !Longitude) {
            e.LocationName = "Please search and select a valid location from the list.";
        }
        if (MaxVolunteers.trim()) {
        const mv = Number(MaxVolunteers);
        if (Number.isNaN(mv) || !Number.isInteger(mv)) e.MaxVolunteers = "Max volunteers must be an integer.";
        else if (mv <= 0) e.MaxVolunteers = "Max volunteers must be > 0.";
        }

        return e;
  }

  const handleLocationChange = (text: string) => {
        setLocation(text);
        if (errorMsg) setErrorMsg(null);
        clearError("LocationName");

        setLatitude("");
        setLongitude("");

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (text.length > 2) {
            debounceRef.current = setTimeout(async () => {
                setIsGeocoding(true);
                const suggestions = await getPlacesSuggestions(text);
                setLocationSuggestions(suggestions);
                setShowLocationMenu(suggestions.length > 0);
                setIsGeocoding(false);
            }, 400);
        } else {
            setShowLocationMenu(false);
            setLocationSuggestions([]);
        }
    };

    const handleSelectLocation = async (suggestion: any) => {
        const displayName = `${suggestion.title} (${suggestion.description})`;
        setLocation(displayName);
        setShowLocationMenu(false);
        setIsGeocoding(true);

        const details = await getLatLongFromPlaceId(suggestion.placeId);
        if (details) {
            setLatitude(String(details.latitude));
            setLongitude(String(details.longitude));
            setAddress(details.address);
        }
        setIsGeocoding(false);
    };

    function mergeDateAndTime(base: Date, time: Date) {
        const d = new Date(base);
        d.setHours(time.getHours(), time.getMinutes(), 0, 0);
        return d;
    }

    function openStartPicker() {
        if (submitting) return;

        if (Platform.OS === "android") {
            DateTimePickerAndroid.open({
            value: StartDateTime,
            mode: "date",
            is24Hour: true,
            onChange: (_e, selectedDate) => {
                if (!selectedDate) return;

                DateTimePickerAndroid.open({
                value: selectedDate,
                mode: "time",
                is24Hour: true,
                onChange: (_e2, selectedTime) => {
                    if (!selectedTime) return;

                    const combined = mergeDateAndTime(selectedDate, selectedTime);
                    setStartDateTime(combined);
                    clearError("StartDateTime");
                },
                });
            },
            });
        return;
    }

        if (Platform.OS === "ios") setShowStartPickerIOS(true);
    }

    function openEndPicker() {
        if (submitting) return;

        if (Platform.OS === "android") {
            DateTimePickerAndroid.open({
            value: EndDateTime,
            mode: "date",
            is24Hour: true,
            onChange: (_e, selectedDate) => {
                if (!selectedDate) return;

                DateTimePickerAndroid.open({
                value: selectedDate,
                mode: "time",
                is24Hour: true,
                onChange: (_e2, selectedTime) => {
                    if (!selectedTime) return;

                    const combined = mergeDateAndTime(selectedDate, selectedTime);
                    setEndDateTime(combined);
                    clearError("EndDateTime");
                },
                });
            },
            });
        return;
    }

        if (Platform.OS === "ios") setShowEndPickerIOS(true);
}

    async function onUpdateEvent() {
        if (submitting) return;
        setErrorMsg(null);

        const v = validate();
        setErrors(v);

        const hasErrors = Object.values(v).some(Boolean);
        if (hasErrors) {
            return;
        }

        setSubmitting(true);
        
        const mvRaw = MaxVolunteers.trim();
        const mv = mvRaw === "" ? null : parseInt(mvRaw, 10);

        try {
            if (!id) return;
            const updateEventResponse = await updateEvent(String(id), {
                title: Title.trim(),
                description: Description,
                category: Category,
                startDateTime: StartDateTime.toISOString(),
                endDateTime: EndDateTime.toISOString(),
                locationName: Location,
                address: Address,
                latitude: parseFloat(Latitude),
                longitude: parseFloat(Longitude),
                maxVolunteers: mv && mv > 0 ? mv : null,
            });

            router.back();
        } catch (e) {
            const err = toAppError(e);
            setErrorMsg(err.message);
        } finally {
            setSubmitting(false);
        }
    }
    
    return(
        <View style={styles.page}>
           <View style={styles.header}>
                <Pressable
                    onPress={() =>router.back()}
                    hitSlop={10}
                    style={styles.backBtn}
                >
                    <FontAwesome name="arrow-left" size={18} color="#fff" />
                </Pressable>

                <Text style={styles.headerTitle}>Update Event</Text>

                <View style={styles.rightSpacer} />
            </View>

            <KeyboardAvoidingView
                style={styles.flex1}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >

            <ScrollView keyboardShouldPersistTaps="handled" >
                <View style={styles.card}>
                    <Text style={styles.label}>Title</Text>
                    <View style={styles.inputWrap}>
                        <TextInput 
                        value={Title}
                        onChangeText={(t) =>{
                            setTitle(t);
                            if(errorMsg) setErrorMsg(null);
                        }}
                        placeholder="Title"
                        autoCapitalize="none"
                        keyboardType="default"
                        placeholderTextColor="#8B93A7"
                        style={styles.input}
                        editable={!submitting}
                        />
                    </View>

                    <Text style={[styles.label, styles.labelSpaced]}>Description</Text>
                    <View style={styles.inputWrap}>
                        <TextInput 
                        value={Description}
                        onChangeText={(t) =>{
                            setDescription(t);
                            if(errorMsg) setErrorMsg(null);
                        }}
                        placeholder="Description"
                        autoCapitalize="none"
                        keyboardType="default"
                        placeholderTextColor="#8B93A7"
                        style={styles.input}
                        editable={!submitting}
                        />
                    </View>

                    <Text style={[styles.label, styles.labelSpaced]}>Category</Text>
                    <View style={styles.inputWrap}>
                    <Pressable
                        style={styles.pressableInput}
                        onPress={() => setShowCategoryModal(true)}
                        disabled={submitting}
                    >
                        <Text style={categoryLabel ? styles.valueText : styles.placeholderText}>
                        {categoryLabel || "Category"}
                        </Text>
                    </Pressable>
                    </View>

                    {showCategoryModal ? (
                    <Modal transparent animationType="fade" visible={showCategoryModal}>
                        <Pressable style={styles.modalOverlay} onPress={() => setShowCategoryModal(false)}>
                        <Pressable style={styles.modalSheet} onPress={() => {}}>
                            <View style={styles.modalHeader}>
                            <Pressable onPress={() => setShowCategoryModal(false)}>
                                <Text style={styles.modalBtn}>Close</Text>
                            </Pressable>
                            <Text style={styles.modalHeaderTitle}>Category</Text>
                            <View style={styles.modalHeaderSpacer} />
                            </View>

                            {EVENT_CATEGORIES.map((c) => (
                            <Pressable
                                key={c.value}
                                style={styles.optionRow}
                                onPress={() => {
                                setCategory(c.value); 
                                setShowCategoryModal(false);
                                if (errorMsg) setErrorMsg(null);
                                }}
                            >
                                <Text style={styles.optionText}>{c.label}</Text>
                            </Pressable>
                            ))}
                        </Pressable>
                        </Pressable>
                    </Modal>
                    ) : null}

                    <Text style={[styles.label, styles.labelSpaced]}>Start Date and Time</Text>
                    <View style={styles.inputWrap}>
                    {Platform.OS === "web" ? (
                        <input
                        type="datetime-local"
                        value={formatForWebInput(StartDateTime || "")}
                        onChange={(e: any) => {
                            const d = parseWebInputToDate(e.target.value);
                            if (d) setStartDateTime(d);
                            if (errorMsg) setErrorMsg(null);
                        }}
                        disabled={submitting}
                        style={
                            {
                            height: 54,
                            paddingLeft: 16,
                            paddingRight: 16,
                            fontSize: 15,
                            border: "none",
                            width: "100%",
                            boxSizing: "border-box",
                            background: "transparent",
                            color: "#1E2A3B",
                            } as any
                        }
                        />
                    ) : (
                        <Pressable style={styles.pressableInput} onPress={openStartPicker} disabled={submitting}>
                        <Text style={StartDateTime ? styles.valueText : styles.placeholderText}>
                            {StartDateTime ? StartDateTime.toLocaleString() : "Start Date and Time"}
                        </Text>
                        </Pressable>
                    )}
                    </View>

                    <Text style={[styles.label, styles.labelSpaced]}>End Date and Time</Text>
                    <View style={styles.inputWrap}>
                    {Platform.OS === "web" ? (
                        <input
                        type="datetime-local"
                        value={formatForWebInput(EndDateTime || "")}
                        onChange={(e: any) => {
                            const d = parseWebInputToDate(e.target.value);
                            if (d) setEndDateTime(d);
                            if (errorMsg) setErrorMsg(null);
                        }}
                        disabled={submitting}
                        style={
                            {
                            height: 54,
                            paddingLeft: 16,
                            paddingRight: 16,
                            fontSize: 15,
                            border: "none",
                            width: "100%",
                            boxSizing: "border-box",
                            background: "transparent",
                            color: "#1E2A3B",
                            } as any
                        }
                        />
                    ) : (
                        <Pressable style={styles.pressableInput} onPress={openEndPicker} disabled={submitting}>
                        <Text style={EndDateTime ? styles.valueText : styles.placeholderText}>
                            {EndDateTime ? EndDateTime.toLocaleString() : "End Date and Time"}
                        </Text>
                        </Pressable>
                    )}
                    </View>

                    <Text style={[styles.label, styles.labelSpaced]}>Location</Text>
                     <View style={styles.autocompleteWrapper}>
                            {showLocationMenu && locationSuggestions.length > 0 && (
                                <View style={styles.autocompleteList}>
                                    <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>
                                        {locationSuggestions.map((item, index) => (
                                            <Pressable 
                                                key={item.placeId} 
                                                style={[
                                                    styles.suggestionItem,
                                                    index === locationSuggestions.length - 1 && styles.suggestionItemLast
                                                ]}
                                                onPress={() => handleSelectLocation(item)}
                                            >
                                                <Text style={styles.suggestionTitle} numberOfLines={1}>
                                                    {item.title}
                                                </Text>
                                                <Text style={styles.suggestionDesc} numberOfLines={1}>
                                                    {item.description}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            <View style={[styles.inputWrap, styles.locationInputWrap]}>
                                <TextInput 
                                    value={Location}
                                    onChangeText={handleLocationChange}
                                    placeholder="Search for a place..."
                                    autoCapitalize="none"
                                    style={[styles.input, styles.locationInput]}
                                    editable={!submitting}
                                />
                                {isGeocoding ? (
                                    <ActivityIndicator size="small" color="#3F5E95" />
                                ) : (Latitude && Longitude) ? (
                                    <FontAwesome name="check-circle" size={18} color="#4CAF50" />
                                ) : null}
                            </View>
                        </View>

                    <Text style={[styles.label, styles.labelSpaced]}>Max Volunteers</Text>
                    <View style={styles.inputWrap}>
                        <TextInput 
                        value={MaxVolunteers}
                        onChangeText={(t) =>{
                            setMaxVolunteers(t);
                            if(errorMsg) setErrorMsg(null);
                        }}
                        placeholder="Unlimited if left empty"
                        autoCapitalize="none"
                        keyboardType="numeric"
                        placeholderTextColor="#8B93A7"
                        style={styles.input}
                        editable={!submitting}
                        />  
                    </View>

                </View>

                {(errorMsg || Object.values(errors).some(Boolean)) ? (
                <View style={styles.errorContainer}>
                    {errorMsg ? (
                    <Text style={styles.errorMain}>
                        {errorMsg}
                    </Text>
                    ) : null}

                    {Object.entries(errors)
                    .filter(([, msg]) => !!msg)
                    .map(([key, msg]) => (
                        <Text key={key} style={styles.errorField}>
                        • {msg}
                        </Text>
                    ))}
                </View>
                ) : null}


                <Pressable
                    disabled={submitting}
                    style={[styles.primaryBtn, submitting && styles.primaryBtnDisabled, styles.primaryBtnTopMargin]}
                    onPress={onUpdateEvent}
                >
                    <Text style={styles.primaryBtnText}>
                        {submitting ? "Updating Event..." : "Update Event"}
                    </Text>
                </Pressable>


            </ScrollView>
            </KeyboardAvoidingView>

            {Platform.OS === "ios" && showStartPickerIOS ? (
            <Modal visible transparent animationType="fade">
                <Pressable style={styles.modalOverlay} onPress={() => setShowStartPickerIOS(false)}>
                <Pressable style={styles.modalSheet} onPress={() => {}}>
                    <View style={styles.modalHeader}>
                    <Pressable onPress={() => setShowStartPickerIOS(false)}>
                        <Text style={styles.modalBtn}>Done</Text>
                    </Pressable>
                    </View>

                    <DateTimePicker
                    value={StartDateTime}
                    mode="datetime"
                    display="spinner"
                    onChange={(_e, d) => d && setStartDateTime(d)}
                    />
                </Pressable>
                </Pressable>
            </Modal>
            ) : null}

            {Platform.OS === "ios" && showEndPickerIOS ? (
            <Modal visible transparent animationType="fade">
                <Pressable style={styles.modalOverlay} onPress={() => setShowEndPickerIOS(false)}>
                <Pressable style={styles.modalSheet} onPress={() => {}}>
                    <View style={styles.modalHeader}>
                    <Pressable onPress={() => setShowEndPickerIOS(false)}>
                        <Text style={styles.modalBtn}>Done</Text>
                    </Pressable>
                    </View>

                    <DateTimePicker
                    value={EndDateTime}
                    mode="datetime"
                    display="spinner"
                    onChange={(_e, d) => d && setEndDateTime(d)}
                    />
                </Pressable>
                </Pressable>
            </Modal>
            ) : null}

        </View>
    );
}