"use client";

import { useAtom } from "jotai";
import { assessmentAtom } from "@/store/assessment";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function StepAboutYou() {
  const [assessment, setAssessment] = useAtom(assessmentAtom);

  const update = (field: keyof typeof assessment, value: string) => {
    setAssessment({ ...assessment, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">About You</h2>
        <p className="mt-1 text-muted-foreground">
          Let&apos;s start with the basics so we can personalize your blueprint.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="Your first name"
          value={assessment.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ageRange">Age Range</Label>
        <Select
          value={assessment.ageRange}
          onValueChange={(v) => v && update("ageRange", v)}
        >
          <SelectTrigger id="ageRange">
            <SelectValue placeholder="Select age range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="18-24">18–24</SelectItem>
            <SelectItem value="25-34">25–34</SelectItem>
            <SelectItem value="35-44">35–44</SelectItem>
            <SelectItem value="45-54">45–54</SelectItem>
            <SelectItem value="55+">55+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="City, Country"
          value={assessment.location}
          onChange={(e) => update("location", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="currentJob">Current Job</Label>
        <Input
          id="currentJob"
          placeholder="e.g. Software Engineer at Tech Co"
          value={assessment.currentJob}
          onChange={(e) => update("currentJob", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="familySituation">Family Situation</Label>
        <Textarea
          id="familySituation"
          placeholder="e.g. Married with two kids, single, caring for parents..."
          value={assessment.familySituation}
          onChange={(e) => update("familySituation", e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
}
