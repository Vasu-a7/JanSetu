import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { LoaderCircle, MapPin, Mic, Radio, Sparkles, Upload, UserCheck, Volume2, Wand2 } from "lucide-react";
import { categorizeChallenge, convertToHinglish, defaultCategories, enhanceDescription, type ChallengeCategory } from "@/lib/geminiAI";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function ReportView() {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef("");
  const networkRetryRef = useRef(false);
  const keepListeningRef = useRef(false);
  const { user, profile } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ChallengeCategory | "">("");
  const [photoName, setPhotoName] = useState("");
  const [locationText, setLocationText] = useState("");
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isConvertingVoice, setIsConvertingVoice] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [speechLang, setSpeechLang] = useState<"hi-IN" | "en-IN">("hi-IN");
  const [transcriptText, setTranscriptText] = useState("");
  const [formMessage, setFormMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  async function runAiEnhanceDescription() {
    if (!description.trim()) {
      toast.error("Please type a short description or voice note first before enhancing.");
      return;
    }

    setIsEnhancing(true);
    toast.info("AI is enhancing and structuring your report description...");
    try {
      const enhanced = await enhanceDescription(description);
      setDescription(enhanced);
      toast.success("Description enhanced with AI! You can edit any text directly in the input box.");

      setIsCategorizing(true);
      const catResult = await categorizeChallenge(enhanced);
      setCategory(catResult.category);
    } catch (err) {
      console.error("Enhance error", err);
      toast.error("Could not enhance description.");
    } finally {
      setIsEnhancing(false);
      setIsCategorizing(false);
    }
  }

  async function runAiCategorize() {
    if (!description.trim()) {
      setFormMessage({
        type: "error",
        text: "Please enter a detailed description first so AI can categorize it.",
      });
      return;
    }

    setIsCategorizing(true);
    setFormMessage(null);
    try {
      const result = await categorizeChallenge(description);
      setCategory(result.category);
    } catch (error) {
      setFormMessage({
        type: "error",
        text: error instanceof Error ? error.message : "AI categorization unavailable. Type a category manually.",
      });
    } finally {
      setIsCategorizing(false);
    }
  }

  function startVoiceTyping() {
    if (isListening) {
      keepListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_e) {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Voice Typing is not supported in this browser. Please use Google Chrome or MS Edge.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLang;

      keepListeningRef.current = true;
      transcriptRef.current = "";
      setTranscriptText("");
      setIsListening(true);
      toast.info(`Microphone ON (${speechLang === "hi-IN" ? "Hindi" : "English"}). Speak now! Click mic button when finished.`);

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentText = "";
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript + " ";
        }
        const trimmed = currentText.trim();
        transcriptRef.current = trimmed;
        setTranscriptText(trimmed);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition notice:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          keepListeningRef.current = false;
          setIsListening(false);
          toast.error("Microphone permission denied. Please allow microphone access in your browser settings.");
        }
      };

      recognition.onend = async () => {
        setIsListening(false);
        const finalSpokenText = transcriptRef.current.trim() || transcriptText.trim();

        if (finalSpokenText) {
          setIsConvertingVoice(true);
          toast.info("Processing spoken text...");
          try {
            const hinglishResult = await convertToHinglish(finalSpokenText);
            const textToInsert = hinglishResult || finalSpokenText;
            setDescription((prev) => (prev ? `${prev}\n${textToInsert}` : textToInsert));
            
            if (!title.trim()) {
              setTitle(textToInsert.slice(0, 50) + (textToInsert.length > 50 ? "..." : ""));
            }
            toast.success("Voice text added to description!");

            setIsCategorizing(true);
            const catResult = await categorizeChallenge(textToInsert);
            setCategory(catResult.category);
          } catch (err) {
            console.error("Hinglish conversion fallback:", err);
            setDescription((prev) => (prev ? `${prev}\n${finalSpokenText}` : finalSpokenText));
            toast.success("Voice text added to description!");
          } finally {
            setIsConvertingVoice(false);
            setIsCategorizing(false);
          }
        }
      };

      recognition.start();
    } catch (err) {
      console.error("Voice recognition start error:", err);
      setIsListening(false);
      toast.error("Could not start microphone. Please check browser microphone permissions.");
    }
  }

  async function handleDescriptionBlur() {
    if (!description.trim() || category) {
      return;
    }
    await runAiCategorize();
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPhotoName(file?.name ?? "");
  }

  function handleGetLocation() {
    if (!navigator.geolocation) {
      setFormMessage({
        type: "error",
        text: "Location services are not available in this browser.",
      });
      return;
    }

    setIsLocating(true);
    setFormMessage(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords: currentCoords }) => {
        setCoordinates({
          latitude: currentCoords.latitude,
          longitude: currentCoords.longitude,
        });
        setCoordinates({
          latitude: currentCoords.latitude,
          longitude: currentCoords.longitude,
        });
        const gpsStr = `GPS (${currentCoords.latitude.toFixed(4)}°, ${currentCoords.longitude.toFixed(4)}°)`;
        if (!locationText.trim()) {
          setLocationText(gpsStr);
        } else if (!locationText.includes("GPS")) {
          setLocationText(`${locationText.trim()} - ${gpsStr}`);
        }
        toast.success("GPS location captured!");
        setIsLocating(false);
      },
      () => {
        setFormMessage({
          type: "error",
          text: "We couldn't access your location. You can still type your address manually in the field above.",
        });
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormMessage(null);

    if (!user) {
      setFormMessage({
        type: "error",
        text: "Reporting an issue requires log in first. Redirecting to login...",
      });
      setTimeout(() => {
        window.location.href = "/auth?redirect=/report";
      }, 1500);
      return;
    }

    if (!title.trim() || !description.trim()) {
      setFormMessage({ type: "error", text: "Add an issue title and detailed description first." });
      return;
    }

    if (!category) {
      setFormMessage({
        type: "error",
        text: "Please select a category for your report before submitting.",
      });
      return;
    }

    setIsSubmitting(true);
    const newChallenge = {
      id: "report-" + Date.now(),
      title: title.trim(),
      description: description.trim(),
      category,
      status: "open" as const,
      location_text: locationText.trim() || "Reported Location",
      latitude: coordinates?.latitude ?? null,
      longitude: coordinates?.longitude ?? null,
      media_url: photoName || null,
      user_id: user.id,
      reporter_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(user.id);
    const validUserId = isUuid ? user.id : null;

    let supabaseSaved = false;
    let errorDetail = "";

    // Insert into Supabase using exact database column schema
    try {
      const cleanPayload = {
        title: newChallenge.title,
        description: newChallenge.description,
        category: newChallenge.category,
        status: "open",
        location: newChallenge.location_text || null,
        photo_url: newChallenge.media_url || null,
        user_id: validUserId,
      };

      const { error } = await supabase.from("reported_data").insert(cleanPayload);

      if (error) {
        console.error("Supabase primary insert notice:", error);
        // Fallback retry with legacy column keys if needed
        const legacyPayload = {
          title: newChallenge.title,
          description: newChallenge.description,
          category: newChallenge.category,
          status: "open",
          location_text: newChallenge.location_text,
          media_url: newChallenge.media_url,
          user_id: validUserId,
          reporter_id: validUserId,
        };
        const { error: retryErr } = await supabase.from("reported_data").insert(legacyPayload);
        if (retryErr) {
          console.error("Supabase insert error:", retryErr);
          errorDetail = retryErr.message || "Insert constraint notice";
        } else {
          supabaseSaved = true;
        }
      } else {
        supabaseSaved = true;
      }
    } catch (err: any) {
      console.error("Supabase connection exception:", err);
      errorDetail = err?.message || "Connection error";
    }

    // Always save report locally in localStorage as reliable fallback
    if (typeof window !== "undefined") {
      try {
        const localItems = JSON.parse(localStorage.getItem("jansetu_user_challenges") || "[]");
        localItems.unshift(newChallenge);
        localStorage.setItem("jansetu_user_challenges", JSON.stringify(localItems));
      } catch (_e) {
        console.error("LocalStorage save error:", _e);
      }
    }

    setIsSubmitting(false);
    setTitle("");
    setDescription("");
    setCategory("");
    setPhotoName("");
    setLocationText("");
    setCoordinates(null);

    if (supabaseSaved) {
      setFormMessage({
        type: "success",
        text: "Your issue has been reported and securely saved to the Supabase backend!",
      });
      toast.success("Report saved to Supabase backend!");
    } else {
      setFormMessage({
        type: "success",
        text: `Your issue has been saved! (Backend note: ${errorDetail || "Saved locally"}).`,
      });
      toast.info("Report saved locally!");
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl px-5 py-8 sm:py-10">
      <header className="mb-8">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">New report</p>
          {user ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600">
              <UserCheck className="size-3.5" />
              Reporting as <strong className="font-semibold">{profile?.full_name || user.email}</strong>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              Reporting anonymously
            </span>
          )}
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          Help improve your community.
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          Share a local issue and we will route it to the right civic category.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7"
      >
        <div className="space-y-2">
          <label htmlFor="issue-title" className="text-sm font-semibold text-foreground">
            Issue Title
          </label>
          <Input
            id="issue-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Broken streetlight near the library"
            required
          />
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="issue-description" className="text-sm font-semibold text-foreground">
              Detailed Description
            </label>

            {/* Voice & AI Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={runAiEnhanceDescription}
                disabled={isEnhancing || !description.trim()}
                className="gap-1.5 font-semibold text-xs border-primary/30 text-primary hover:bg-primary/5 shadow-xs"
              >
                {isEnhancing ? (
                  <LoaderCircle className="size-3.5 animate-spin text-primary" />
                ) : (
                  <Sparkles className="size-3.5 text-primary" />
                )}
                {isEnhancing ? "Enhancing..." : "Enhance Description with AI ✨"}
              </Button>

              <div className="inline-flex rounded-lg border border-border p-0.5 text-xs bg-muted/50">
                <button
                  type="button"
                  onClick={() => setSpeechLang("hi-IN")}
                  className={`px-2 py-1 rounded-md transition-colors font-medium ${
                    speechLang === "hi-IN"
                      ? "bg-background text-primary shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🇮🇳 Hindi
                </button>
                <button
                  type="button"
                  onClick={() => setSpeechLang("en-IN")}
                  className={`px-2 py-1 rounded-md transition-colors font-medium ${
                    speechLang === "en-IN"
                      ? "bg-background text-primary shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🇬🇧 English
                </button>
              </div>

              <Button
                type="button"
                variant={isListening ? "destructive" : "secondary"}
                size="sm"
                onClick={startVoiceTyping}
                disabled={isConvertingVoice}
                className="gap-1.5 font-medium shadow-xs text-xs"
              >
                {isConvertingVoice ? (
                  <LoaderCircle className="size-3.5 animate-spin text-primary" />
                ) : isListening ? (
                  <Radio className="size-3.5 animate-pulse text-destructive-foreground" />
                ) : (
                  <Mic className="size-3.5 text-primary" />
                )}
                {isConvertingVoice
                  ? "Hinglish Converting..."
                  : isListening
                  ? "Listening..."
                  : "Voice Typing"}
              </Button>
            </div>
          </div>

          {/* Quick Spoken Voice Sample Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-muted-foreground mr-1 flex items-center gap-1">
              🗣️ Quick Voice Presets:
            </span>
            {[
              "Sadak par bade potholes hain near Bistupur Market",
              "Main water supply pipeline leak ho gaya hai Ward 14 me",
              "Streetlights broken near Doranda College dark alley",
              "Garbage dump overflowing near temple pilgrimage route",
            ].map((presetText) => (
              <button
                key={presetText}
                type="button"
                onClick={async () => {
                  setDescription(presetText);
                  if (!title.trim()) {
                    setTitle(presetText.slice(0, 45) + "...");
                  }
                  toast.success("Voice sample loaded! Enhancing with AI...");
                  setIsEnhancing(true);
                  try {
                    const enhanced = await enhanceDescription(presetText);
                    setDescription(enhanced);
                    setIsCategorizing(true);
                    const catResult = await categorizeChallenge(enhanced);
                    setCategory(catResult.category);
                  } catch (_e) {
                  } finally {
                    setIsEnhancing(false);
                    setIsCategorizing(false);
                  }
                }}
                className="rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary transition-colors truncate max-w-[220px]"
                title={`Click to load voice sample: "${presetText}"`}
              >
                "{presetText.slice(0, 32)}..."
              </button>
            ))}
          </div>

          {/* Active listening status / Hinglish Conversion notice */}
          {isListening && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200 animate-pulse flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Radio className="size-4 animate-bounce text-amber-600 dark:text-amber-400 shrink-0" />
                <span>
                  <strong>Recording live voice ({speechLang === "hi-IN" ? "Hindi" : "English"}):</strong>{" "}
                  {transcriptText || "Listening... Start speaking..."}
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-semibold bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 px-2 py-0.5 rounded">
                Live Mic
              </span>
            </div>
          )}

          {isConvertingVoice && (
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-xs text-primary flex items-center gap-2">
              <Sparkles className="size-4 animate-spin shrink-0" />
              <span>AI is converting your voice input into Romanized Hinglish script...</span>
            </div>
          )}

          <Textarea
            id="issue-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            onBlur={() => void handleDescriptionBlur()}
            placeholder="Describe what is happening, where, and who it affects. (Or click 'Voice Typing' to speak in Hindi/English!)"
            className="min-h-36 resize-y"
            required
          />
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Volume2 className="size-3.5 text-primary shrink-0" />
            <span>
              {isCategorizing
                ? "Auto-suggesting civic category with AI..."
                : "Voice typing converts your speech to Hinglish & automatically sets issue details and AI category."}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="issue-category" className="text-sm font-semibold text-foreground">
              Category
            </label>
            <button
              type="button"
              onClick={() => void runAiCategorize()}
              disabled={isCategorizing || !description.trim()}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline disabled:opacity-50"
            >
              <Sparkles className="size-3.5" />
              {isCategorizing ? "AI Categorizing..." : "Auto-Categorize with AI"}
            </button>
          </div>
          <div className="relative">
            <Input
              id="issue-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Sanitation & Drainage, Street Lighting, Cybercrime, etc."
              className="pr-10"
              required
            />
            {isCategorizing ? (
              <LoaderCircle
                className="absolute right-3 top-3 size-4 animate-spin text-primary pointer-events-none"
                aria-hidden
              />
            ) : (
              <Sparkles
                className="absolute right-3 top-3 size-4 text-primary pointer-events-none opacity-70"
                aria-hidden
              />
            )}
          </div>
          <div className="pt-1">
            <p className="text-xs text-muted-foreground mb-1.5">
              Quick suggestions (click to select or type any custom field):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {defaultCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    category.toLowerCase() === cat.toLowerCase()
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Exact Location & GPS Section */}
        <div className="space-y-3">
          <label htmlFor="issue-location" className="text-sm font-semibold text-foreground">
            Exact Location / Address / Landmark
          </label>
          <div className="relative">
            <Input
              id="issue-location"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              placeholder="e.g. Flat 3B, Main Road near City Hospital, Doranda, Ranchi"
              className="pl-9"
              required
            />
            <MapPin className="absolute left-3 top-3 size-4 text-muted-foreground" aria-hidden />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              {coordinates
                ? `GPS Captured: (${coordinates.latitude.toFixed(4)}°, ${coordinates.longitude.toFixed(4)}°)`
                : "Enter exact house/street/landmark address above or auto-fetch GPS below."}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGetLocation}
              disabled={isLocating}
              className="gap-1.5 h-8 text-xs font-medium"
            >
              {isLocating ? (
                <LoaderCircle className="size-3.5 animate-spin text-primary" aria-hidden />
              ) : (
                <MapPin className="size-3.5 text-primary" aria-hidden />
              )}
              {isLocating ? "Fetching GPS..." : "Auto-Fetch GPS Location"}
            </Button>
          </div>
        </div>

        {/* Upload Photo Section */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Upload Photo (Optional)</label>
          <div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="sr-only"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => photoInputRef.current?.click()}
            >
              <Upload className="size-4 text-primary" aria-hidden />
              {photoName ? photoName : "Choose Photo Image..."}
            </Button>
            {photoName && (
              <p className="mt-1.5 truncate text-xs text-muted-foreground">{photoName}</p>
            )}
          </div>
        </div>

        {formMessage && (
          <p
            role={formMessage.type === "error" ? "alert" : "status"}
            className={
              formMessage.type === "error" ? "text-sm text-destructive" : "text-sm text-emerald-700"
            }
          >
            {formMessage.text}
          </p>
        )}

        <Button type="submit" className="h-11 w-full" disabled={isSubmitting || isCategorizing}>
          {isSubmitting && <LoaderCircle className="animate-spin" aria-hidden />}
          {isSubmitting ? "Submitting report..." : "Submit Report"}
        </Button>
      </form>
    </section>
  );
}
