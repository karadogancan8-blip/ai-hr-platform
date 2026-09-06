import { LeaveWorkspace } from "@/components/hr-admin/LeaveWorkspace";
import { OzlukAutopilotBoard } from "@/components/hr-admin/OzlukAutopilotBoard";

export default function OzlukPage() {
  return (
    <div className="space-y-8">
      <LeaveWorkspace showAutopilot={false} />
      <OzlukAutopilotBoard />
    </div>
  );
}
