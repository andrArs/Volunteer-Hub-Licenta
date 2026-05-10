import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { goBack } from "@/src/utils/navigation";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useMemo, useRef, useState } from "react";
import { styles } from "@/src/styles/event.style";
import { toAppError } from "@/src/api/errors";
import { createEvent, uploadEventImage } from "@/src/api/event.api";
import * as ImagePicker from "expo-image-picker";
import { EVENT_CATEGORIES, EventCategory } from "@/src/types/event";
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { getPlacesSuggestions, getLatLongFromPlaceId } from "@/src/utils/location.utils";
import { t, useLanguage } from "@/src/i18n/index";

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

export default function CreateEventScreen() {
    const router= useRouter();
    useLanguage();

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

    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageMime, setImageMime] = useState<string | undefined>(undefined);

    function clearError(k: keyof FieldErrors) {
     setErrors((p) => ({ ...p, [k]: undefined, general: undefined }));
    }

    const categoryLabel = useMemo(() => {
        const found = EVENT_CATEGORIES.find((c) => c.value === Category);
        return found?.label ?? "";
    }, [Category]);

    function validate(): FieldErrors {
        const e: FieldErrors = {};

        const titleVal = Title.trim();
        const d = Description.trim();
        const ln = Location.trim();
        const a = Address.trim();

        if (!titleVal) e.Title = t("eventCreate.errors.titleRequired");
        else if (titleVal.length > 200) e.Title = t("eventCreate.errors.titleTooLong");

        if (!d) e.Description = t("eventCreate.errors.descriptionRequired");
        else if (d.length > 2000) e.Description = t("eventCreate.errors.descriptionTooLong");

        if (Category === undefined || Category === null) e.Category = t("eventCreate.errors.categoryRequired");

        if (!StartDateTime || isNaN(StartDateTime.getTime())) e.StartDateTime = t("eventCreate.errors.startRequired");
        if(StartDateTime && StartDateTime.getTime() < Date.now()) e.StartDateTime = t("eventCreate.errors.startPast");
        if (!EndDateTime || isNaN(EndDateTime.getTime())) e.EndDateTime = t("eventCreate.errors.endRequired");
        if (StartDateTime && EndDateTime && EndDateTime.getTime() < StartDateTime.getTime()) {
          e.EndDateTime = t("eventCreate.errors.endBeforeStart");
        }

        if (!ln) e.LocationName = t("eventCreate.errors.locationRequired");
        else if (ln.length > 300) e.LocationName = t("eventCreate.errors.locationTooLong");

        if (!Latitude || !Longitude) {
            e.LocationName = t("eventCreate.errors.locationInvalid");
        }

        if (MaxVolunteers.trim()) {
          const mv = Number(MaxVolunteers);
          if (Number.isNaN(mv) || !Number.isInteger(mv)) e.MaxVolunteers = t("eventCreate.errors.maxVolunteersInteger");
          else if (mv <= 0) e.MaxVolunteers = t("eventCreate.errors.maxVolunteersPositive");
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

    const resetForm = useCallback(() => {
        setTitle("");
        setDescription("");
        setCategory(EVENT_CATEGORIES[0].value);

        const now = new Date();
        setStartDateTime(now);
        setEndDateTime(new Date(now.getTime() + 60 * 60 * 1000));

        setLocation("");
        setAddress("");
        setLatitude("");
        setLongitude("");
        setMaxVolunteers("");

        setErrors({});
        setErrorMsg(null);
        setShowCategoryModal(false);
        setShowStartPickerIOS(false);
        setShowEndPickerIOS(false);
        setImageUri(null);
        setImageMime(undefined);
        }, []);

       useFocusEffect(
        useCallback(() => {
        setErrors({});
        setErrorMsg(null);
        }, [])
        );


    async function pickImage() {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });
        if (result.canceled) return;
        const asset = result.assets[0];
        setImageUri(asset.uri);
        setImageMime(asset.mimeType ?? undefined);
    }

    async function onCreateEvent() {
        if (submitting) return;
        setErrorMsg(null);

        const v = validate();
        setErrors(v);

        const hasErrors = Object.values(v).some(Boolean);
        if (hasErrors) {
            return;
        }

        setSubmitting(true);

        try {
            const createEventResponse = await createEvent({
                title: Title.trim(),
                description: Description,
                category: Category as EventCategory,
                startDateTime: StartDateTime.toISOString(),
                endDateTime: EndDateTime.toISOString(),
                locationName: Location,
                address: Address,
                latitude: parseFloat(Latitude),
                longitude: parseFloat(Longitude),
                maxVolunteers: parseInt(MaxVolunteers),
                });

            if (imageUri) {
                try {
                    await uploadEventImage(createEventResponse.id, imageUri, imageMime);
                } catch {}
            }
            resetForm();
            router.replace(`/event.view?id=${createEventResponse.id}`);
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
                    onPress={() => goBack()}
                    hitSlop={10}
                    style={styles.backBtn}
                >
                    <FontAwesome name="arrow-left" size={18} color="#fff" />
                </Pressable>

                <Text style={styles.headerTitle}>{t("eventCreate.title")}</Text>

                <View style={styles.rightSpacer} />
            </View>

            <KeyboardAvoidingView
                style={styles.flex1}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >

            <ScrollView keyboardShouldPersistTaps="handled">
                <View style={styles.card}>
                    <Text style={styles.label}>{t("eventCreate.labelTitle")}</Text>
                    <View style={styles.inputWrap}>
                        <TextInput
                        value={Title}
                        onChangeText={(val) =>{
                            setTitle(val);
                            if(errorMsg) setErrorMsg(null);
                        }}
                        placeholder={t("eventCreate.placeholderTitle")}
                        autoCapitalize="none"
                        keyboardType="default"
                        placeholderTextColor="#8B93A7"
                        style={styles.input}
                        editable={!submitting}
                        />
                    </View>

                    <Text style={[styles.label, styles.labelSpaced]}>{t("eventCreate.labelDescription")}</Text>
                    <View style={styles.inputWrap}>
                        <TextInput
                        value={Description}
                        onChangeText={(val) =>{
                            setDescription(val);
                            if(errorMsg) setErrorMsg(null);
                        }}
                        placeholder={t("eventCreate.placeholderDescription")}
                        autoCapitalize="none"
                        keyboardType="default"
                        placeholderTextColor="#8B93A7"
                        style={styles.input}
                        editable={!submitting}
                        />
                    </View>

                    <Text style={[styles.label, styles.labelSpaced]}>{t("eventCreate.labelCategory")}</Text>
                    <View style={styles.inputWrap}>
                    <Pressable
                        style={styles.pressableInput}
                        onPress={() => setShowCategoryModal(true)}
                        disabled={submitting}
                    >
                        <Text style={categoryLabel ? styles.valueText : styles.placeholderText}>
                        {categoryLabel || t("eventCreate.labelCategory")}
                        </Text>
                    </Pressable>
                    </View>

                    {showCategoryModal ? (
                    <Modal transparent animationType="fade" visible={showCategoryModal}>
                        <Pressable style={styles.modalOverlay} onPress={() => setShowCategoryModal(false)}>
                        <Pressable style={styles.modalSheet} onPress={() => {}}>
                            <View style={styles.modalHeader}>
                            <Pressable onPress={() => setShowCategoryModal(false)}>
                                <Text style={styles.modalBtn}>{t("common.close")}</Text>
                            </Pressable>
                            <Text style={styles.modalHeaderTitle}>{t("eventCreate.labelCategory")}</Text>
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

                    <Text style={[styles.label, styles.labelSpaced]}>{t("eventCreate.labelStartDateTime")}</Text>
                    <View style={styles.inputWrap}>
                    {Platform.OS === "web" ? (
                        <input
                        type="datetime-local"
                        value={formatForWebInput(StartDateTime)}
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
                            {StartDateTime ? StartDateTime.toLocaleString() : t("eventCreate.placeholderStartDateTime")}
                        </Text>
                        </Pressable>
                    )}
                    </View>

                    <Text style={[styles.label, styles.labelSpaced]}>{t("eventCreate.labelEndDateTime")}</Text>
                    <View style={styles.inputWrap}>
                    {Platform.OS === "web" ? (
                        <input
                        type="datetime-local"
                        value={formatForWebInput(EndDateTime)}
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
                            {EndDateTime ? EndDateTime.toLocaleString() : t("eventCreate.placeholderEndDateTime")}
                        </Text>
                        </Pressable>
                    )}
                    </View>

                    <Text style={[styles.label, styles.labelSpaced]}>{t("eventCreate.labelLocation")}</Text>
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
                                placeholder={t("eventCreate.placeholderLocation")}
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

                    <Text style={[styles.label, styles.labelSpaced]}>{t("eventCreate.labelMaxVolunteers")}</Text>
                    <View style={styles.inputWrap}>
                        <TextInput
                        value={MaxVolunteers}
                        onChangeText={(val) =>{
                            setMaxVolunteers(val);
                            if(errorMsg) setErrorMsg(null);
                        }}
                        placeholder={t("eventCreate.placeholderMaxVolunteers")}
                        autoCapitalize="none"
                        keyboardType="numeric"
                        placeholderTextColor="#8B93A7"
                        style={styles.input}
                        editable={!submitting}
                        />
                    </View>

                    <Text style={[styles.label, styles.labelSpaced]}>{t("eventCreate.labelImage")}</Text>
                    {imageUri ? (
                        <View>
                            <Image source={{ uri: imageUri }} style={{ width: "100%", height: 180, borderRadius: 8, marginBottom: 8 }} resizeMode="cover" />
                            <View style={{ flexDirection: "row", gap: 8, justifyContent: "flex-end" }}>
                                <Pressable onPress={pickImage} disabled={submitting} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: "#3F5E95" }}>
                                    <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>{t("eventCreate.changeImage")}</Text>
                                </Pressable>
                                <Pressable onPress={() => { setImageUri(null); setImageMime(undefined); }} disabled={submitting} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: "#E53E3E" }}>
                                    <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>{t("eventCreate.removeImage")}</Text>
                                </Pressable>
                            </View>
                        </View>
                    ) : (
                        <Pressable onPress={pickImage} disabled={submitting} style={{ borderWidth: 1.5, borderColor: "#3F5E95", borderStyle: "dashed", borderRadius: 10, paddingVertical: 18, alignItems: "center", justifyContent: "center", gap: 6 }}>
                            <FontAwesome name="image" size={22} color="#3F5E95" />
                            <Text style={{ color: "#3F5E95", fontSize: 14, fontWeight: "600" }}>{t("eventCreate.addImage")}</Text>
                        </Pressable>
                    )}

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
                    onPress={onCreateEvent}
                >
                    <Text style={styles.primaryBtnText}>
                        {submitting ? t("eventCreate.creating") : t("eventCreate.createBtn")}
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
                        <Text style={styles.modalBtn}>{t("common.done")}</Text>
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
                        <Text style={styles.modalBtn}>{t("common.done")}</Text>
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
