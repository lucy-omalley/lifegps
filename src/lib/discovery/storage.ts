import type {
  DiscoveryModuleId,
  DiscoveryProgress,
  FaceReading,
  NumerologyReading,
  PalmReading,
  TarotReading,
  UnifiedProfile,
} from "@/types/discovery";
import type { CompassAssessment } from "@/types";

const PROGRESS_KEY = "lifegps_discovery_progress";
const PALM_KEY = "lifegps_palm_reading";
const FACE_KEY = "lifegps_face_reading";
const NUMEROLOGY_KEY = "lifegps_numerology_reading";
const TAROT_KEY = "lifegps_tarot_reading";
const UNIFIED_KEY = "lifegps_unified_profile";

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(key);
  return stored ? (JSON.parse(stored) as T) : null;
}

function write<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

export function getDiscoveryProgress(): DiscoveryProgress {
  return (
    read<DiscoveryProgress>(PROGRESS_KEY) ?? {
      completedModules: [],
      freeModuleUsed: false,
      isPremium: false,
    }
  );
}

export function saveDiscoveryProgress(progress: DiscoveryProgress) {
  write(PROGRESS_KEY, progress);
}

export function markModuleComplete(moduleId: DiscoveryModuleId) {
  const progress = getDiscoveryProgress();
  if (!progress.completedModules.includes(moduleId)) {
    progress.completedModules.push(moduleId);
    if (!progress.isPremium && !progress.freeModuleUsed) {
      progress.freeModuleUsed = true;
    }
    saveDiscoveryProgress(progress);
  }
}

export function savePalmReading(reading: PalmReading) {
  write(PALM_KEY, reading);
  markModuleComplete("palm");
}

export function getPalmReading(): PalmReading | null {
  return read<PalmReading>(PALM_KEY);
}

export function saveFaceReading(reading: FaceReading) {
  write(FACE_KEY, reading);
  markModuleComplete("face");
}

export function getFaceReading(): FaceReading | null {
  return read<FaceReading>(FACE_KEY);
}

export function saveNumerologyReading(reading: NumerologyReading) {
  write(NUMEROLOGY_KEY, reading);
  markModuleComplete("numerology");
}

export function getNumerologyReading(): NumerologyReading | null {
  return read<NumerologyReading>(NUMEROLOGY_KEY);
}

export function saveTarotReading(reading: TarotReading) {
  write(TAROT_KEY, reading);
  markModuleComplete("tarot");
}

export function getTarotReading(): TarotReading | null {
  return read<TarotReading>(TAROT_KEY);
}

export function saveUnifiedProfile(profile: UnifiedProfile) {
  write(UNIFIED_KEY, profile);
}

export function getUnifiedProfile(): UnifiedProfile | null {
  return read<UnifiedProfile>(UNIFIED_KEY);
}

export function markQuizComplete(assessment?: CompassAssessment | null) {
  if (assessment?.results) {
    markModuleComplete("quiz");
  }
}

export function getAllModuleData() {
  return {
    progress: getDiscoveryProgress(),
    palm: getPalmReading(),
    face: getFaceReading(),
    numerology: getNumerologyReading(),
    tarot: getTarotReading(),
    unified: getUnifiedProfile(),
  };
}
