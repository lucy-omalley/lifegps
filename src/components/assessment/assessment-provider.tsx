"use client";

import { Provider } from "jotai";
import { AssessmentForm } from "@/components/assessment/assessment-form";

export function AssessmentProvider() {
  return (
    <Provider>
      <AssessmentForm />
    </Provider>
  );
}
