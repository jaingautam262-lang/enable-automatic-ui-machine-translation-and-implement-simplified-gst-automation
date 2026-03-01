import { useState, useEffect, useRef } from 'react';
import {
  useGetAllConsultations,
  useAddConsultationMessage,
  useAddConsultationDocument,
  useUpdateCAContactInfo,
  useUpdateConsultationFees,
} from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, Send, Upload, FileText, Users, Clock, AlertCircle, Edit, Building2, Phone, Mail, User, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';
import { formatDateTime, formatCurrency } from '../../lib/formatters';
import { ExternalBlob } from '../../backend';
import type { CAContactInfo } from '../../types';

export default function CAConsultationTab() {
  const { data: consultations = [], isLoading } = useGetAllConsultations();
  const { identity } = useInternetIdentity();
  const addMessage = useAddConsultationMessage();
  const addDocument = useAddConsultationDocument();
  const updateContactInfo = useUpdateCAContactInfo();
  const updateFees = useUpdateConsultationFees();
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [messageText, setMessageText] = useState('');
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingFees, setIsEditingFees] = useState(false);
  const [editedContactInfo, setEditedContactInfo] = useState<CAContactInfo>({
    name: '',
    firmName: '',
    phone: '',
    email: '',
  });
  const [editedFees, setEditedFees] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentPrincipal = identity?.getPrincipal();

  useEffect(() => {
    if (consultations.length > 0 && !selectedConsultation) {
      setSelectedConsultation(consultations[0]);
    }
  }, [consultations, selectedConsultation]);

  useEffect(() => {
    if (selectedConsultation) {
      setEditedContactInfo(selectedConsultation.caContactInfo);
      setEditedFees(selectedConsultation.consultationFees);
    }
  }, [selectedConsultation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConsultation?.messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConsultation || !currentPrincipal) {
      toast.error('Please enter a message');
      return;
    }

    const recipient = currentPrincipal.toString() === selectedConsultation.admin.toString()
      ? selectedConsultation.client
      : selectedConsultation.admin;

    try {
      await addMessage.mutateAsync({
        consultationId: selectedConsultation.id,
        recipient,
        message: messageText,
      });
      setMessageText('');
      toast.success('Message sent');
    } catch (error) {
      toast.error('Failed to send message');
      console.error(error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConsultation) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array);

      await addDocument.mutateAsync({
        consultationId: selectedConsultation.id,
        document: blob,
      });
      toast.success('Document uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload document');
      console.error(error);
    }
  };

  const handleUpdateContactInfo = async () => {
    if (!selectedConsultation) return;

    if (!editedContactInfo.name || !editedContactInfo.firmName || !editedContactInfo.phone || !editedContactInfo.email) {
      toast.error('Please fill in all contact information fields');
      return;
    }

    try {
      await updateContactInfo.mutateAsync({
        consultationId: selectedConsultation.id,
        caContactInfo: editedContactInfo,
      });
      setIsEditingContact(false);
      toast.success('CA contact information updated');
    } catch (error) {
      toast.error('Failed to update contact information');
      console.error(error);
    }
  };

  const handleUpdateFees = async () => {
    if (!selectedConsultation) return;

    if (editedFees < 0) {
      toast.error('Consultation fees must be a positive number');
      return;
    }

    try {
      await updateFees.mutateAsync({
        consultationId: selectedConsultation.id,
        consultationFees: editedFees,
      });
      setIsEditingFees(false);
      toast.success('Consultation fees updated');
    } catch (error) {
      toast.error('Failed to update consultation fees');
      console.error(error);
    }
  };

  const isAdmin = currentPrincipal && selectedConsultation && 
    currentPrincipal.toString() === selectedConsultation.admin.toString();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">CA Consultation</h2>
        <p className="text-muted-foreground">Professional communication and document sharing with Chartered Accountants</p>
      </div>

      {consultations.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Active Consultations</AlertTitle>
          <AlertDescription>
            You don't have any active consultations yet. Contact your administrator to set up a consultation with a Chartered Accountant.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Consultations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Consultations
              </CardTitle>
              <CardDescription>Your active CA consultations</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {consultations.map((consultation) => {
                    const isCurrentAdmin = currentPrincipal?.toString() === consultation.admin.toString();
                    const otherParty = isCurrentAdmin ? 'Client' : 'CA';
                    const isSelected = selectedConsultation?.id === consultation.id;

                    return (
                      <Button
                        key={consultation.id.toString()}
                        variant={isSelected ? 'default' : 'outline'}
                        className="w-full justify-start"
                        onClick={() => setSelectedConsultation(consultation)}
                      >
                        <div className="flex flex-col items-start w-full">
                          <div className="flex items-center gap-2 w-full">
                            <MessageSquare className="h-4 w-4" />
                            <span className="font-medium">{otherParty}</span>
                            <Badge variant="secondary" className="ml-auto">
                              {consultation.messages.length}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(consultation.lastUpdated)}
                          </span>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    {isAdmin ? 'Client Communication' : 'CA Communication'}
                  </CardTitle>
                  <CardDescription>
                    Professional chat and document sharing
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={addDocument.isPending}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* CA Contact Information */}
              {selectedConsultation && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        CA Contact Information
                      </CardTitle>
                      {isAdmin && (
                        <Dialog open={isEditingContact} onOpenChange={setIsEditingContact}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit CA Contact Information</DialogTitle>
                              <DialogDescription>
                                Update the contact details for the Chartered Accountant
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="ca-name">CA Name</Label>
                                <Input
                                  id="ca-name"
                                  value={editedContactInfo.name}
                                  onChange={(e) => setEditedContactInfo({ ...editedContactInfo, name: e.target.value })}
                                  placeholder="Enter CA name"
                                />
                              </div>
                              <div>
                                <Label htmlFor="firm-name">Firm Name</Label>
                                <Input
                                  id="firm-name"
                                  value={editedContactInfo.firmName}
                                  onChange={(e) => setEditedContactInfo({ ...editedContactInfo, firmName: e.target.value })}
                                  placeholder="Enter firm name"
                                />
                              </div>
                              <div>
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                  id="phone"
                                  value={editedContactInfo.phone}
                                  onChange={(e) => setEditedContactInfo({ ...editedContactInfo, phone: e.target.value })}
                                  placeholder="Enter phone number"
                                />
                              </div>
                              <div>
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  value={editedContactInfo.email}
                                  onChange={(e) => setEditedContactInfo({ ...editedContactInfo, email: e.target.value })}
                                  placeholder="Enter email address"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsEditingContact(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleUpdateContactInfo} disabled={updateContactInfo.isPending}>
                                {updateContactInfo.isPending ? 'Saving...' : 'Save Changes'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Name:</span>
                      <span>{selectedConsultation.caContactInfo.name || 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Firm:</span>
                      <span>{selectedConsultation.caContactInfo.firmName || 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Phone:</span>
                      <span>{selectedConsultation.caContactInfo.phone || 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Email:</span>
                      <span>{selectedConsultation.caContactInfo.email || 'Not set'}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Consultation Fees:</span>
                        <span className="text-lg font-semibold text-primary">
                          {formatCurrency(selectedConsultation.consultationFees)}
                        </span>
                      </div>
                      {isAdmin && (
                        <Dialog open={isEditingFees} onOpenChange={setIsEditingFees}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Consultation Fees</DialogTitle>
                              <DialogDescription>
                                Update the consultation fees (in INR)
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="fees">Consultation Fees (INR)</Label>
                                <Input
                                  id="fees"
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={editedFees}
                                  onChange={(e) => setEditedFees(parseFloat(e.target.value) || 0)}
                                  placeholder="Enter consultation fees"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsEditingFees(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleUpdateFees} disabled={updateFees.isPending}>
                                {updateFees.isPending ? 'Saving...' : 'Save Changes'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Shared Documents */}
              {selectedConsultation && selectedConsultation.sharedDocuments.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Shared Documents</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedConsultation.sharedDocuments.map((doc: any, index: number) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (doc.getDirectURL) {
                            window.open(doc.getDirectURL(), '_blank');
                          } else {
                            toast.info('Document preview not available');
                          }
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Document {index + 1}
                      </Button>
                    ))}
                  </div>
                  <Separator />
                </div>
              )}

              {/* Messages */}
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {selectedConsultation?.messages.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No messages yet</p>
                      <p className="text-sm">Start the conversation by sending a message</p>
                    </div>
                  ) : (
                    selectedConsultation?.messages.map((msg: any, index: number) => {
                      const isSender = currentPrincipal?.toString() === msg.sender.toString();
                      return (
                        <div
                          key={index}
                          className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isSender
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3 opacity-70" />
                              <span className="text-xs opacity-70">
                                {formatDateTime(msg.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={addMessage.isPending || !messageText.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            About CA Consultation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Professional Communication:</strong> Secure messaging system for direct communication with your Chartered Accountant
          </p>
          <p>
            <strong>CA Contact Details:</strong> View and manage CA contact information including name, firm, phone, and email
          </p>
          <p>
            <strong>Consultation Fees:</strong> Track and manage consultation fees with proper INR formatting
          </p>
          <p>
            <strong>Document Sharing:</strong> Upload and share financial documents, reports, and supporting materials
          </p>
          <p>
            <strong>Audit Support:</strong> Collaborate on audit preparation, compliance checks, and financial reviews
          </p>
          <p>
            <strong>Real-time Updates:</strong> Get instant notifications when your CA responds or shares documents
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
