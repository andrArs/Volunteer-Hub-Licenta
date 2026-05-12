import { I18n } from "i18n-js";
import * as Localization from "expo-localization";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getToken } from "../platform/storage";
import { updateLanguage } from "../api/user.api";

import en from "./en";
import ro from "./ro";

const LANG_KEY = "app_language";

export const i18n = new I18n({ en, ro });
i18n.enableFallback = true;
i18n.defaultLocale = "en";

async function getLang(): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(LANG_KEY);
  }
  return SecureStore.getItemAsync(LANG_KEY);
}

async function saveLang(lang: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(LANG_KEY, lang);
    return;
  }
  await SecureStore.setItemAsync(LANG_KEY, lang);
}

type LanguageContextType = {
  locale: string;
  setLocale: (lang: string) => Promise<void>;
};

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  setLocale: async () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState("en");

  useEffect(() => {
    getLang().then((saved) => {
      const deviceLang = Localization.getLocales()[0]?.languageCode ?? "en";
      const lang = saved ?? (deviceLang === "ro" ? "ro" : "en");
      i18n.locale = lang;
      setLocaleState(lang);
    });
  }, []);

  async function setLocale(lang: string) {
    i18n.locale = lang;
    setLocaleState(lang);
    await saveLang(lang);
    const token = await getToken();
    if (token) {
      updateLanguage(lang).catch(() => {});
    }
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function t(scope: string, options?: object): string {
  return i18n.t(scope, options);
}
