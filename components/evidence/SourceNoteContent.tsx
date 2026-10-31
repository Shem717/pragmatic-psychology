import { PrtQualification } from "@/components/evidence/PrtQualification";
import { SpaceQualification } from "@/components/evidence/SpaceQualification";
import { MovementLearningQualification } from "@/components/evidence/MovementLearningQualification";
import { ResilienceTrainingQualification } from "@/components/evidence/ResilienceTrainingQualification";
import { LightTherapyQualification } from "@/components/evidence/LightTherapyQualification";
import { AdhdDiagnosticQualification } from "@/components/evidence/AdhdDiagnosticQualification";
import { BehavioralActivationQualification } from "@/components/evidence/BehavioralActivationQualification";
import { InsomniaDepressionQualification } from "@/components/evidence/InsomniaDepressionQualification";
import { PanicDiagnosticQualification } from "@/components/evidence/PanicDiagnosticQualification";
import { FreezingAssaultQualification } from "@/components/evidence/FreezingAssaultQualification";
import { TraumaTransmissionQualification } from "@/components/evidence/TraumaTransmissionQualification";
import { SleepLatencyQualification } from "@/components/evidence/SleepLatencyQualification";
import { MriQualification } from "@/components/evidence/MriQualification";
import { HrvQualification } from "@/components/evidence/HrvQualification";
import { CholineQualification } from "@/components/evidence/CholineQualification";
import { MeditationBenefitQualification } from "@/components/evidence/MeditationBenefitQualification";
import { PostpartumQualification } from "@/components/evidence/PostpartumQualification";
import { RelaxationQualification } from "@/components/evidence/RelaxationQualification";
import { AlcoholQualification } from "@/components/evidence/AlcoholQualification";
import { CardiacQualification } from "@/components/evidence/CardiacQualification";
import { RatioQualification } from "@/components/evidence/RatioQualification";
import { SensoryQualification } from "@/components/evidence/SensoryQualification";
import { AgeQualification } from "@/components/evidence/AgeQualification";
import { CaffeineQualification } from "@/components/evidence/CaffeineQualification";

export const sourceNoteComponents = {
  "caffeine-and-adenosine": CaffeineQualification,
  "age-groups-and-aging": AgeQualification,
  "sensory-kit-evidence": SensoryQualification,
  "relationship-ratios": RatioQualification,
  "bereavement-cardiac-statistic": CardiacQualification,
  "alcohol-and-sleep": AlcoholQualification,
  "relaxation-related-anxiety": RelaxationQualification,
  "postpartum-screening-estimates": PostpartumQualification,
  "mindfulness-comparators": MeditationBenefitQualification,
  "choline-mrs-measurement": CholineQualification,
  "breathing-hrv-measures": HrvQualification,
  "mindfulness-mri": MriQualification,
  "writing-and-sleep-onset": SleepLatencyQualification,
  "trauma-and-inheritance": TraumaTransmissionQualification,
  "nonresistance-and-immobility": FreezingAssaultQualification,
  "panic-and-medical-exclusion": PanicDiagnosticQualification,
  "sleep-and-depression-outcomes": InsomniaDepressionQualification,
  "behavioral-activation-comparisons": BehavioralActivationQualification,
  "adhd-diagnostic-context": AdhdDiagnosticQualification,
  "light-treatment-study": LightTherapyQualification,
  "resilience-training-measures": ResilienceTrainingQualification,
  "movement-integrated-learning": MovementLearningQualification,
  "prt-package-and-video": PrtQualification,
  "space-and-child-cbt": SpaceQualification,
} as const;
