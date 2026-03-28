import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Building2,
  Edit,
  IndianRupee,
  Mail,
  Phone,
  Plus,
  Search,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useCreateCAProfile,
  useDeleteCAProfile,
  useGetAllCAProfiles,
  useSearchCAProfiles,
  useUpdateCAProfile,
} from "../../hooks/useQueries";
import { formatCurrency } from "../../lib/formatters";
import type { CharteredAccountantProfile } from "../../types";

export default function CAProfileManagementTab() {
  const { data: caProfiles = [], isLoading } = useGetAllCAProfiles();
  const createProfile = useCreateCAProfile();
  const updateProfile = useUpdateCAProfile();
  const deleteProfile = useDeleteCAProfile();
  const searchProfiles = useSearchCAProfiles();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] =
    useState<CharteredAccountantProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    firmName: "",
    contactDetails: "",
    consultationFees: "",
    specialization: "",
    availability: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      firmName: "",
      contactDetails: "",
      consultationFees: "",
      specialization: "",
      availability: "",
    });
  };

  const handleAdd = async () => {
    if (
      !formData.name ||
      !formData.firmName ||
      !formData.contactDetails ||
      !formData.consultationFees
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createProfile.mutateAsync({
        name: formData.name,
        firmName: formData.firmName,
        contactDetails: formData.contactDetails,
        consultationFees: Number.parseFloat(formData.consultationFees),
        specialization: formData.specialization,
        availability: formData.availability,
        billingHistory: [],
      });
      toast.success("CA profile created successfully");
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to create CA profile");
      console.error(error);
    }
  };

  const handleEdit = (profile: CharteredAccountantProfile) => {
    setSelectedProfile(profile);
    setFormData({
      name: profile.name,
      firmName: profile.firmName,
      contactDetails: profile.contactDetails,
      consultationFees: profile.consultationFees.toString(),
      specialization: profile.specialization,
      availability: profile.availability,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedProfile) return;

    if (
      !formData.name ||
      !formData.firmName ||
      !formData.contactDetails ||
      !formData.consultationFees
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await updateProfile.mutateAsync({
        id: selectedProfile.id,
        profile: {
          id: selectedProfile.id,
          name: formData.name,
          firmName: formData.firmName,
          contactDetails: formData.contactDetails,
          consultationFees: Number.parseFloat(formData.consultationFees),
          specialization: formData.specialization,
          availability: formData.availability,
          billingHistory: selectedProfile.billingHistory,
        },
      });
      toast.success("CA profile updated successfully");
      setIsEditDialogOpen(false);
      setSelectedProfile(null);
      resetForm();
    } catch (error) {
      toast.error("Failed to update CA profile");
      console.error(error);
    }
  };

  const handleDelete = async (id: bigint) => {
    if (
      !confirm(
        "Are you sure you want to delete this CA profile? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await deleteProfile.mutateAsync(id);
      toast.success("CA profile deleted successfully");
    } catch (error) {
      toast.error("Failed to delete CA profile");
      console.error(error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    try {
      const results = await searchProfiles.mutateAsync(searchQuery);
      toast.success(`Found ${results.length} CA profile(s)`);
    } catch (error) {
      toast.error("Search failed");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            CA Profile Management
          </h2>
          <p className="text-muted-foreground">
            Developer-level administration for Chartered Accountant profiles
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add CA Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New CA Profile</DialogTitle>
              <DialogDescription>
                Create a new Chartered Accountant profile with contact and fee
                information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">CA Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter CA name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firmName">Firm Name *</Label>
                  <Input
                    id="firmName"
                    placeholder="Enter firm name"
                    value={formData.firmName}
                    onChange={(e) =>
                      setFormData({ ...formData, firmName: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactDetails">Contact Details *</Label>
                <Textarea
                  id="contactDetails"
                  placeholder="Phone, email, address..."
                  value={formData.contactDetails}
                  onChange={(e) =>
                    setFormData({ ...formData, contactDetails: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="consultationFees">
                    Consultation Fees (INR) *
                  </Label>
                  <Input
                    id="consultationFees"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="5000"
                    value={formData.consultationFees}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        consultationFees: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Input
                    id="availability"
                    placeholder="Mon-Fri, 9 AM - 5 PM"
                    value={formData.availability}
                    onChange={(e) =>
                      setFormData({ ...formData, availability: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  placeholder="Tax, Audit, GST, etc."
                  value={formData.specialization}
                  onChange={(e) =>
                    setFormData({ ...formData, specialization: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={createProfile.isPending}>
                {createProfile.isPending ? "Creating..." : "Create Profile"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Alert className="border-primary/20 bg-primary/5">
        <Shield className="h-4 w-4" />
        <AlertTitle>Developer/Admin Access Only</AlertTitle>
        <AlertDescription>
          This interface allows adding, editing, and deleting CA profiles.
          Changes affect all consultations and user interactions.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Search CA Profiles</CardTitle>
          <CardDescription>Find CA profiles by name or firm</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search by name or firm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={searchProfiles.isPending}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CA Profiles ({caProfiles.length})</CardTitle>
          <CardDescription>
            Manage Chartered Accountant profiles and information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Loading CA profiles...</p>
            </div>
          ) : caProfiles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No CA profiles found</p>
              <p className="text-sm mt-2">
                Click "Add CA Profile" to create one
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Firm</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Fees</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {caProfiles.map((profile) => (
                  <TableRow key={profile.id.toString()}>
                    <TableCell className="font-medium">
                      {profile.name}
                    </TableCell>
                    <TableCell>{profile.firmName}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {profile.contactDetails}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(profile.consultationFees)}
                    </TableCell>
                    <TableCell>
                      {profile.specialization ? (
                        <Badge variant="secondary">
                          {profile.specialization}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {profile.availability || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(profile)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(profile.id)}
                          disabled={deleteProfile.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit CA Profile</DialogTitle>
            <DialogDescription>
              Update Chartered Accountant profile information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">CA Name *</Label>
                <Input
                  id="edit-name"
                  placeholder="Enter CA name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-firmName">Firm Name *</Label>
                <Input
                  id="edit-firmName"
                  placeholder="Enter firm name"
                  value={formData.firmName}
                  onChange={(e) =>
                    setFormData({ ...formData, firmName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contactDetails">Contact Details *</Label>
              <Textarea
                id="edit-contactDetails"
                placeholder="Phone, email, address..."
                value={formData.contactDetails}
                onChange={(e) =>
                  setFormData({ ...formData, contactDetails: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-consultationFees">
                  Consultation Fees (INR) *
                </Label>
                <Input
                  id="edit-consultationFees"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="5000"
                  value={formData.consultationFees}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      consultationFees: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-availability">Availability</Label>
                <Input
                  id="edit-availability"
                  placeholder="Mon-Fri, 9 AM - 5 PM"
                  value={formData.availability}
                  onChange={(e) =>
                    setFormData({ ...formData, availability: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-specialization">Specialization</Label>
              <Input
                id="edit-specialization"
                placeholder="Tax, Audit, GST, etc."
                value={formData.specialization}
                onChange={(e) =>
                  setFormData({ ...formData, specialization: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedProfile(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Updating..." : "Update Profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
