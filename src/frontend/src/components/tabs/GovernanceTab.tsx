import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatINR } from "@/lib/formatters";
import {
  AlertCircle,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  Download,
  Edit,
  FileText,
  Mic,
  Plus,
  Search,
  Shield,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { VoiceInput } from "../VoiceInput";
import SecurityComplianceScanTab from "./SecurityComplianceScanTab";

interface BoardMeeting {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  agenda: string[];
  attendees: string[];
  minutes?: string;
  actionItems: ActionItem[];
  status: "scheduled" | "completed" | "cancelled";
}

interface ActionItem {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  status: "pending" | "in-progress" | "completed";
}

interface Document {
  id: string;
  name: string;
  type: "minutes" | "resolution" | "register" | "other";
  uploadDate: Date;
  version: number;
  uploadedBy: string;
}

interface Shareholder {
  id: string;
  name: string;
  email: string;
  phone: string;
  shares: number;
  sharePercentage: number;
  role: "director" | "shareholder" | "both";
}

interface ComplianceAlert {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: "high" | "medium" | "low";
  status: "pending" | "completed" | "overdue";
  category: "filing" | "meeting" | "audit" | "other";
}

interface DirectorSurvey {
  id: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  responses: SurveyResponse[];
  createdDate: Date;
  dueDate: Date;
  status: "active" | "closed";
}

interface SurveyQuestion {
  id: string;
  question: string;
  type: "rating" | "text" | "multiple-choice";
  options?: string[];
}

interface SurveyResponse {
  questionId: string;
  respondent: string;
  answer: string | number;
  timestamp: Date;
}

// Helper function to format Date objects
function formatLocalDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function GovernanceTab() {
  const [activeSubTab, setActiveSubTab] = useState("meetings");
  const [meetings, setMeetings] = useState<BoardMeeting[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [complianceAlerts, setComplianceAlerts] = useState<ComplianceAlert[]>(
    [],
  );
  const [surveys, setSurveys] = useState<DirectorSurvey[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);
  const [isAddShareholderOpen, setIsAddShareholderOpen] = useState(false);
  const [isAddAlertOpen, setIsAddAlertOpen] = useState(false);
  const [isAddSurveyOpen, setIsAddSurveyOpen] = useState(false);

  // Meeting form state
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingLocation, setMeetingLocation] = useState("");
  const [meetingAgenda, setMeetingAgenda] = useState("");
  const [meetingAttendees, setMeetingAttendees] = useState("");
  const [meetingMinutes, setMeetingMinutes] = useState("");

  // Document form state
  const [documentName, setDocumentName] = useState("");
  const [documentType, setDocumentType] = useState<
    "minutes" | "resolution" | "register" | "other"
  >("minutes");

  // Shareholder form state
  const [shareholderName, setShareholderName] = useState("");
  const [shareholderEmail, setShareholderEmail] = useState("");
  const [shareholderPhone, setShareholderPhone] = useState("");
  const [shareholderShares, setShareholderShares] = useState("");
  const [shareholderRole, setShareholderRole] = useState<
    "director" | "shareholder" | "both"
  >("shareholder");

  // Compliance alert form state
  const [alertTitle, setAlertTitle] = useState("");
  const [alertDescription, setAlertDescription] = useState("");
  const [alertDueDate, setAlertDueDate] = useState("");
  const [alertPriority, setAlertPriority] = useState<"high" | "medium" | "low">(
    "medium",
  );
  const [alertCategory, setAlertCategory] = useState<
    "filing" | "meeting" | "audit" | "other"
  >("filing");

  // Survey form state
  const [surveyTitle, setSurveyTitle] = useState("");
  const [surveyDescription, setSurveyDescription] = useState("");
  const [surveyDueDate, setSurveyDueDate] = useState("");

  const handleAddMeeting = () => {
    if (!meetingTitle || !meetingDate || !meetingTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newMeeting: BoardMeeting = {
      id: Date.now().toString(),
      title: meetingTitle,
      date: new Date(meetingDate),
      time: meetingTime,
      location: meetingLocation,
      agenda: meetingAgenda.split("\n").filter((item) => item.trim()),
      attendees: meetingAttendees
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a),
      minutes: meetingMinutes || undefined,
      actionItems: [],
      status: "scheduled",
    };

    setMeetings([...meetings, newMeeting]);
    setIsAddMeetingOpen(false);
    resetMeetingForm();
    toast.success("Board meeting scheduled successfully");
  };

  const handleAddDocument = () => {
    if (!documentName) {
      toast.error("Please enter document name");
      return;
    }

    const newDocument: Document = {
      id: Date.now().toString(),
      name: documentName,
      type: documentType,
      uploadDate: new Date(),
      version: 1,
      uploadedBy: "Current User",
    };

    setDocuments([...documents, newDocument]);
    setIsAddDocumentOpen(false);
    resetDocumentForm();
    toast.success("Document added successfully");
  };

  const handleAddShareholder = () => {
    if (!shareholderName || !shareholderEmail || !shareholderShares) {
      toast.error("Please fill in all required fields");
      return;
    }

    const shares = Number.parseInt(shareholderShares);
    const totalShares =
      shareholders.reduce((sum, sh) => sum + sh.shares, 0) + shares;

    const newShareholder: Shareholder = {
      id: Date.now().toString(),
      name: shareholderName,
      email: shareholderEmail,
      phone: shareholderPhone,
      shares: shares,
      sharePercentage: (shares / totalShares) * 100,
      role: shareholderRole,
    };

    setShareholders([...shareholders, newShareholder]);
    setIsAddShareholderOpen(false);
    resetShareholderForm();
    toast.success("Shareholder added successfully");
  };

  const handleAddAlert = () => {
    if (!alertTitle || !alertDueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newAlert: ComplianceAlert = {
      id: Date.now().toString(),
      title: alertTitle,
      description: alertDescription,
      dueDate: new Date(alertDueDate),
      priority: alertPriority,
      status: "pending",
      category: alertCategory,
    };

    setComplianceAlerts([...complianceAlerts, newAlert]);
    setIsAddAlertOpen(false);
    resetAlertForm();
    toast.success("Compliance alert created successfully");
  };

  const handleAddSurvey = () => {
    if (!surveyTitle || !surveyDueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newSurvey: DirectorSurvey = {
      id: Date.now().toString(),
      title: surveyTitle,
      description: surveyDescription,
      questions: [],
      responses: [],
      createdDate: new Date(),
      dueDate: new Date(surveyDueDate),
      status: "active",
    };

    setSurveys([...surveys, newSurvey]);
    setIsAddSurveyOpen(false);
    resetSurveyForm();
    toast.success("Director survey created successfully");
  };

  const resetMeetingForm = () => {
    setMeetingTitle("");
    setMeetingDate("");
    setMeetingTime("");
    setMeetingLocation("");
    setMeetingAgenda("");
    setMeetingAttendees("");
    setMeetingMinutes("");
  };

  const resetDocumentForm = () => {
    setDocumentName("");
    setDocumentType("minutes");
  };

  const resetShareholderForm = () => {
    setShareholderName("");
    setShareholderEmail("");
    setShareholderPhone("");
    setShareholderShares("");
    setShareholderRole("shareholder");
  };

  const resetAlertForm = () => {
    setAlertTitle("");
    setAlertDescription("");
    setAlertDueDate("");
    setAlertPriority("medium");
    setAlertCategory("filing");
  };

  const resetSurveyForm = () => {
    setSurveyTitle("");
    setSurveyDescription("");
    setSurveyDueDate("");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      scheduled: "default",
      completed: "secondary",
      cancelled: "destructive",
      pending: "outline",
      "in-progress": "default",
      overdue: "destructive",
      active: "default",
      closed: "secondary",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      high: "destructive",
      medium: "default",
      low: "secondary",
    };
    return <Badge variant={variants[priority] || "default"}>{priority}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Governance & Administration
          </h2>
          <p className="text-muted-foreground">
            Manage board meetings, documents, shareholders, compliance, and
            security
          </p>
        </div>
        <img
          src="/assets/generated/governance-dashboard.dim_800x600.png"
          alt="Governance"
          className="h-16 w-16 object-contain"
        />
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="meetings" className="gap-2">
            <Calendar className="h-4 w-4" />
            Meetings
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="shareholders" className="gap-2">
            <Users className="h-4 w-4" />
            Shareholders
          </TabsTrigger>
          <TabsTrigger value="compliance" className="gap-2">
            <Bell className="h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="preparation" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Preparation
          </TabsTrigger>
          <TabsTrigger value="surveys" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Surveys
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Board Meetings Tab */}
        <TabsContent value="meetings" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Board Meeting Management</CardTitle>
                  <CardDescription>
                    Schedule and manage board meetings with agenda and minutes
                  </CardDescription>
                </div>
                <Dialog
                  open={isAddMeetingOpen}
                  onOpenChange={setIsAddMeetingOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Schedule Meeting
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Schedule Board Meeting</DialogTitle>
                      <DialogDescription>
                        Create a new board meeting with agenda and attendees
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="meeting-title">Meeting Title *</Label>
                        <div className="flex gap-2">
                          <Input
                            id="meeting-title"
                            value={meetingTitle}
                            onChange={(e) => setMeetingTitle(e.target.value)}
                            placeholder="e.g., Quarterly Board Meeting"
                          />
                          <VoiceInput
                            onTranscript={(text) => setMeetingTitle(text)}
                            language="en"
                            size="icon"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="meeting-date">Date *</Label>
                          <Input
                            id="meeting-date"
                            type="date"
                            value={meetingDate}
                            onChange={(e) => setMeetingDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="meeting-time">Time *</Label>
                          <Input
                            id="meeting-time"
                            type="time"
                            value={meetingTime}
                            onChange={(e) => setMeetingTime(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="meeting-location">Location</Label>
                        <div className="flex gap-2">
                          <Input
                            id="meeting-location"
                            value={meetingLocation}
                            onChange={(e) => setMeetingLocation(e.target.value)}
                            placeholder="e.g., Conference Room A or Virtual"
                          />
                          <VoiceInput
                            onTranscript={(text) => setMeetingLocation(text)}
                            language="en"
                            size="icon"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="meeting-agenda">
                          Agenda (one item per line)
                        </Label>
                        <div className="flex gap-2">
                          <Textarea
                            id="meeting-agenda"
                            value={meetingAgenda}
                            onChange={(e) => setMeetingAgenda(e.target.value)}
                            placeholder="Review financial statements&#10;Approve budget&#10;Discuss strategic initiatives"
                            rows={5}
                          />
                          <VoiceInput
                            onTranscript={(text) =>
                              setMeetingAgenda(
                                meetingAgenda +
                                  (meetingAgenda ? "\n" : "") +
                                  text,
                              )
                            }
                            language="en"
                            size="icon"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="meeting-attendees">
                          Attendees (comma-separated)
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="meeting-attendees"
                            value={meetingAttendees}
                            onChange={(e) =>
                              setMeetingAttendees(e.target.value)
                            }
                            placeholder="John Doe, Jane Smith, Robert Johnson"
                          />
                          <VoiceInput
                            onTranscript={(text) => setMeetingAttendees(text)}
                            language="en"
                            size="icon"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="meeting-minutes">
                          Minutes (optional)
                        </Label>
                        <div className="flex gap-2">
                          <Textarea
                            id="meeting-minutes"
                            value={meetingMinutes}
                            onChange={(e) => setMeetingMinutes(e.target.value)}
                            placeholder="Meeting minutes and notes..."
                            rows={5}
                          />
                          <VoiceInput
                            onTranscript={(text) =>
                              setMeetingMinutes(
                                meetingMinutes +
                                  (meetingMinutes ? "\n" : "") +
                                  text,
                              )
                            }
                            language="en"
                            size="icon"
                          />
                        </div>
                      </div>
                      <Button onClick={handleAddMeeting} className="w-full">
                        Schedule Meeting
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <img
                src="/assets/generated/board-meeting-interface.dim_800x600.png"
                alt="Board Meetings"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              {meetings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No board meetings scheduled. Click "Schedule Meeting" to
                  create one.
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {meetings.map((meeting) => (
                      <Card key={meeting.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">
                                {meeting.title}
                              </CardTitle>
                              <CardDescription>
                                {formatLocalDate(meeting.date)} at{" "}
                                {meeting.time}
                              </CardDescription>
                            </div>
                            {getStatusBadge(meeting.status)}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <p className="text-sm font-medium">Location:</p>
                            <p className="text-sm text-muted-foreground">
                              {meeting.location || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Agenda:</p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground">
                              {meeting.agenda.map((item, idx) => (
                                // biome-ignore lint/suspicious/noArrayIndexKey: stable list
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Attendees:</p>
                            <p className="text-sm text-muted-foreground">
                              {meeting.attendees.join(", ")}
                            </p>
                          </div>
                          {meeting.minutes && (
                            <div>
                              <p className="text-sm font-medium">Minutes:</p>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {meeting.minutes}
                              </p>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="mr-2 h-4 w-4" />
                              Export
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Management Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Document Management System</CardTitle>
                  <CardDescription>
                    Store and manage minutes, resolutions, and statutory
                    registers
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog
                    open={isAddDocumentOpen}
                    onOpenChange={setIsAddDocumentOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Document
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Document</DialogTitle>
                        <DialogDescription>
                          Upload or create a new governance document
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="doc-name">Document Name *</Label>
                          <Input
                            id="doc-name"
                            value={documentName}
                            onChange={(e) => setDocumentName(e.target.value)}
                            placeholder="e.g., Board Resolution - Q4 2024"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="doc-type">Document Type *</Label>
                          <Select
                            value={documentType}
                            onValueChange={(value: any) =>
                              setDocumentType(value)
                            }
                          >
                            <SelectTrigger id="doc-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="minutes">
                                Meeting Minutes
                              </SelectItem>
                              <SelectItem value="resolution">
                                Board Resolution
                              </SelectItem>
                              <SelectItem value="register">
                                Statutory Register
                              </SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="doc-upload">Upload File</Label>
                          <Input id="doc-upload" type="file" />
                        </div>
                        <Button onClick={handleAddDocument} className="w-full">
                          Add Document
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <img
                src="/assets/generated/document-management-system.dim_800x600.png"
                alt="Documents"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <div className="mb-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No documents uploaded. Click "Add Document" to upload one.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">
                          {doc.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{doc.type}</Badge>
                        </TableCell>
                        <TableCell>v{doc.version}</TableCell>
                        <TableCell>{formatLocalDate(doc.uploadDate)}</TableCell>
                        <TableCell>{doc.uploadedBy}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shareholder Tracking Tab */}
        <TabsContent value="shareholders" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Shareholder Tracking</CardTitle>
                  <CardDescription>
                    Manage shareholder register and communication
                  </CardDescription>
                </div>
                <Dialog
                  open={isAddShareholderOpen}
                  onOpenChange={setIsAddShareholderOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Shareholder
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Shareholder</DialogTitle>
                      <DialogDescription>
                        Add a new shareholder to the register
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="sh-name">Name *</Label>
                        <div className="flex gap-2">
                          <Input
                            id="sh-name"
                            value={shareholderName}
                            onChange={(e) => setShareholderName(e.target.value)}
                            placeholder="Shareholder name"
                          />
                          <VoiceInput
                            onTranscript={(text) => setShareholderName(text)}
                            language="en"
                            size="icon"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sh-email">Email *</Label>
                        <Input
                          id="sh-email"
                          type="email"
                          value={shareholderEmail}
                          onChange={(e) => setShareholderEmail(e.target.value)}
                          placeholder="email@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sh-phone">Phone</Label>
                        <Input
                          id="sh-phone"
                          value={shareholderPhone}
                          onChange={(e) => setShareholderPhone(e.target.value)}
                          placeholder="+91 1234567890"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sh-shares">Number of Shares *</Label>
                        <Input
                          id="sh-shares"
                          type="number"
                          value={shareholderShares}
                          onChange={(e) => setShareholderShares(e.target.value)}
                          placeholder="1000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sh-role">Role *</Label>
                        <Select
                          value={shareholderRole}
                          onValueChange={(value: any) =>
                            setShareholderRole(value)
                          }
                        >
                          <SelectTrigger id="sh-role">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="shareholder">
                              Shareholder
                            </SelectItem>
                            <SelectItem value="director">Director</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleAddShareholder} className="w-full">
                        Add Shareholder
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <img
                src="/assets/generated/shareholder-tracking-dashboard.dim_800x600.png"
                alt="Shareholders"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              {shareholders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No shareholders registered. Click "Add Shareholder" to add
                  one.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Shares</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shareholders.map((sh) => (
                      <TableRow key={sh.id}>
                        <TableCell className="font-medium">{sh.name}</TableCell>
                        <TableCell>{sh.email}</TableCell>
                        <TableCell>{sh.phone}</TableCell>
                        <TableCell>{sh.shares.toLocaleString()}</TableCell>
                        <TableCell>{sh.sharePercentage.toFixed(2)}%</TableCell>
                        <TableCell>
                          <Badge variant="outline">{sh.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Alerts Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Compliance Alerts & Filings</CardTitle>
                  <CardDescription>
                    Track filing deadlines and compliance requirements
                  </CardDescription>
                </div>
                <Dialog open={isAddAlertOpen} onOpenChange={setIsAddAlertOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Alert
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Compliance Alert</DialogTitle>
                      <DialogDescription>
                        Set up a new compliance deadline or reminder
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="alert-title">Title *</Label>
                        <div className="flex gap-2">
                          <Input
                            id="alert-title"
                            value={alertTitle}
                            onChange={(e) => setAlertTitle(e.target.value)}
                            placeholder="e.g., Annual Return Filing"
                          />
                          <VoiceInput
                            onTranscript={(text) => setAlertTitle(text)}
                            language="en"
                            size="icon"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="alert-description">Description</Label>
                        <div className="flex gap-2">
                          <Textarea
                            id="alert-description"
                            value={alertDescription}
                            onChange={(e) =>
                              setAlertDescription(e.target.value)
                            }
                            placeholder="Details about the compliance requirement..."
                            rows={3}
                          />
                          <VoiceInput
                            onTranscript={(text) =>
                              setAlertDescription(
                                alertDescription +
                                  (alertDescription ? "\n" : "") +
                                  text,
                              )
                            }
                            language="en"
                            size="icon"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="alert-due">Due Date *</Label>
                        <Input
                          id="alert-due"
                          type="date"
                          value={alertDueDate}
                          onChange={(e) => setAlertDueDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="alert-priority">Priority *</Label>
                        <Select
                          value={alertPriority}
                          onValueChange={(value: any) =>
                            setAlertPriority(value)
                          }
                        >
                          <SelectTrigger id="alert-priority">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="alert-category">Category *</Label>
                        <Select
                          value={alertCategory}
                          onValueChange={(value: any) =>
                            setAlertCategory(value)
                          }
                        >
                          <SelectTrigger id="alert-category">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="filing">Filing</SelectItem>
                            <SelectItem value="meeting">Meeting</SelectItem>
                            <SelectItem value="audit">Audit</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleAddAlert} className="w-full">
                        Create Alert
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <img
                src="/assets/generated/compliance-alerts-dashboard.dim_800x600.png"
                alt="Compliance"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              {complianceAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No compliance alerts. Click "Add Alert" to create one.
                </div>
              ) : (
                <div className="space-y-4">
                  {complianceAlerts.map((alert) => (
                    <Card key={alert.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">
                              {alert.title}
                            </CardTitle>
                            <CardDescription>
                              {alert.description}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            {getPriorityBadge(alert.priority)}
                            {getStatusBadge(alert.status)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            Due: {formatLocalDate(alert.dueDate)}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark Complete
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Meeting Preparation Tab */}
        <TabsContent value="preparation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meeting Preparation Portal</CardTitle>
              <CardDescription>
                Task lists and pre-meeting documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <img
                src="/assets/generated/meeting-preparation-portal.dim_800x600.png"
                alt="Preparation"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <div className="text-center py-8 text-muted-foreground">
                Meeting preparation tools and checklists will appear here.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Director Surveys Tab */}
        <TabsContent value="surveys" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Director Survey Tools</CardTitle>
                  <CardDescription>
                    Board evaluation and engagement insights
                  </CardDescription>
                </div>
                <Dialog
                  open={isAddSurveyOpen}
                  onOpenChange={setIsAddSurveyOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Survey
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Director Survey</DialogTitle>
                      <DialogDescription>
                        Create a new survey for board evaluation
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="survey-title">Survey Title *</Label>
                        <div className="flex gap-2">
                          <Input
                            id="survey-title"
                            value={surveyTitle}
                            onChange={(e) => setSurveyTitle(e.target.value)}
                            placeholder="e.g., Q4 Board Effectiveness Survey"
                          />
                          <VoiceInput
                            onTranscript={(text) => setSurveyTitle(text)}
                            language="en"
                            size="icon"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="survey-description">Description</Label>
                        <div className="flex gap-2">
                          <Textarea
                            id="survey-description"
                            value={surveyDescription}
                            onChange={(e) =>
                              setSurveyDescription(e.target.value)
                            }
                            placeholder="Survey description and purpose..."
                            rows={3}
                          />
                          <VoiceInput
                            onTranscript={(text) =>
                              setSurveyDescription(
                                surveyDescription +
                                  (surveyDescription ? "\n" : "") +
                                  text,
                              )
                            }
                            language="en"
                            size="icon"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="survey-due">Due Date *</Label>
                        <Input
                          id="survey-due"
                          type="date"
                          value={surveyDueDate}
                          onChange={(e) => setSurveyDueDate(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleAddSurvey} className="w-full">
                        Create Survey
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <img
                src="/assets/generated/director-survey-tools.dim_800x600.png"
                alt="Surveys"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              {surveys.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No surveys created. Click "Create Survey" to start one.
                </div>
              ) : (
                <div className="space-y-4">
                  {surveys.map((survey) => (
                    <Card key={survey.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {survey.title}
                            </CardTitle>
                            <CardDescription>
                              {survey.description}
                            </CardDescription>
                          </div>
                          {getStatusBadge(survey.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Due: {formatLocalDate(survey.dueDate)} | Responses:{" "}
                            {survey.responses.length}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <BarChart3 className="mr-2 h-4 w-4" />
                              View Results
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security & Compliance Scan Tab */}
        <TabsContent value="security" className="space-y-4">
          <SecurityComplianceScanTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
