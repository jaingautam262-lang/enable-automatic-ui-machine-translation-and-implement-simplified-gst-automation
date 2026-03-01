import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Users, Plus, Edit, FileText, Download, AlertCircle, Mic, Calculator, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { formatINR, formatDate } from '../../lib/formatters';
import { VoiceInput } from '../VoiceInput';

export default function PayrollTab() {
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isProcessPayrollOpen, setIsProcessPayrollOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('employees');
  
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    employeeId: '',
    designation: '',
    department: '',
    phone: '',
    email: '',
    address: '',
    bankAccount: '',
    panNumber: '',
    aadhaarNumber: '',
    basicSalary: '',
    hra: '',
    da: '',
    transportAllowance: '',
    medicalAllowance: '',
  });

  const [voiceInputField, setVoiceInputField] = useState<string | null>(null);

  const handleVoiceInput = (field: string, transcript: string) => {
    setNewEmployee((prev) => ({ ...prev, [field]: transcript }));
  };

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.employeeId || !newEmployee.basicSalary) {
      toast.error('Please fill in required fields: Name, Employee ID, and Basic Salary');
      return;
    }

    const basicSalary = parseFloat(newEmployee.basicSalary);
    if (isNaN(basicSalary) || basicSalary <= 0) {
      toast.error('Please enter a valid basic salary');
      return;
    }

    toast.success('Employee added successfully');
    setIsAddEmployeeOpen(false);
    setNewEmployee({
      name: '',
      employeeId: '',
      designation: '',
      department: '',
      phone: '',
      email: '',
      address: '',
      bankAccount: '',
      panNumber: '',
      aadhaarNumber: '',
      basicSalary: '',
      hra: '',
      da: '',
      transportAllowance: '',
      medicalAllowance: '',
    });
  };

  const handleProcessPayroll = () => {
    toast.success('Payroll processed successfully for the current month');
    setIsProcessPayrollOpen(false);
  };

  const handleGeneratePaySlip = (employeeId: string) => {
    toast.info(`Generating pay slip for employee ${employeeId}...`);
    setTimeout(() => {
      toast.success('Pay slip generated and downloaded');
    }, 1000);
  };

  const handleGenerateForm16 = (employeeId: string) => {
    toast.info(`Generating Form 16 for employee ${employeeId}...`);
    setTimeout(() => {
      toast.success('Form 16 generated and downloaded');
    }, 1000);
  };

  const handleExportStatutoryReturns = (returnType: string) => {
    toast.info(`Generating ${returnType} return...`);
    setTimeout(() => {
      toast.success(`${returnType} return exported successfully`);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payroll Management</h2>
          <p className="text-muted-foreground">Manage employees, salaries, and statutory compliance</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Enter employee details with voice input support
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Employee Name *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="name"
                        value={newEmployee.name}
                        onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                        placeholder="Full name"
                      />
                      <VoiceInput
                        onTranscript={(transcript) => handleVoiceInput('name', transcript)}
                        language="en-US"
                        size="icon"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="employeeId"
                        value={newEmployee.employeeId}
                        onChange={(e) => setNewEmployee({ ...newEmployee, employeeId: e.target.value })}
                        placeholder="EMP001"
                      />
                      <VoiceInput
                        onTranscript={(transcript) => handleVoiceInput('employeeId', transcript)}
                        language="en-US"
                        size="icon"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation</Label>
                    <div className="flex gap-2">
                      <Input
                        id="designation"
                        value={newEmployee.designation}
                        onChange={(e) => setNewEmployee({ ...newEmployee, designation: e.target.value })}
                        placeholder="Software Engineer"
                      />
                      <VoiceInput
                        onTranscript={(transcript) => handleVoiceInput('designation', transcript)}
                        language="en-US"
                        size="icon"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <div className="flex gap-2">
                      <Input
                        id="department"
                        value={newEmployee.department}
                        onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                        placeholder="IT"
                      />
                      <VoiceInput
                        onTranscript={(transcript) => handleVoiceInput('department', transcript)}
                        language="en-US"
                        size="icon"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="flex gap-2">
                      <Input
                        id="phone"
                        value={newEmployee.phone}
                        onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                        placeholder="+91 9876543210"
                      />
                      <VoiceInput
                        onTranscript={(transcript) => handleVoiceInput('phone', transcript)}
                        language="en-US"
                        size="icon"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex gap-2">
                      <Input
                        id="email"
                        type="email"
                        value={newEmployee.email}
                        onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                        placeholder="employee@company.com"
                      />
                      <VoiceInput
                        onTranscript={(transcript) => handleVoiceInput('email', transcript)}
                        language="en-US"
                        size="icon"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="flex gap-2">
                    <Input
                      id="address"
                      value={newEmployee.address}
                      onChange={(e) => setNewEmployee({ ...newEmployee, address: e.target.value })}
                      placeholder="Complete address"
                    />
                    <VoiceInput
                      onTranscript={(transcript) => handleVoiceInput('address', transcript)}
                      language="en-US"
                      size="icon"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankAccount">Bank Account Number</Label>
                    <div className="flex gap-2">
                      <Input
                        id="bankAccount"
                        value={newEmployee.bankAccount}
                        onChange={(e) => setNewEmployee({ ...newEmployee, bankAccount: e.target.value })}
                        placeholder="Account number"
                      />
                      <VoiceInput
                        onTranscript={(transcript) => handleVoiceInput('bankAccount', transcript)}
                        language="en-US"
                        size="icon"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="panNumber">PAN Number</Label>
                    <div className="flex gap-2">
                      <Input
                        id="panNumber"
                        value={newEmployee.panNumber}
                        onChange={(e) => setNewEmployee({ ...newEmployee, panNumber: e.target.value.toUpperCase() })}
                        placeholder="ABCDE1234F"
                        maxLength={10}
                      />
                      <VoiceInput
                        onTranscript={(transcript) => handleVoiceInput('panNumber', transcript.toUpperCase())}
                        language="en-US"
                        size="icon"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="aadhaarNumber"
                      value={newEmployee.aadhaarNumber}
                      onChange={(e) => setNewEmployee({ ...newEmployee, aadhaarNumber: e.target.value })}
                      placeholder="1234 5678 9012"
                      maxLength={14}
                    />
                    <VoiceInput
                      onTranscript={(transcript) => handleVoiceInput('aadhaarNumber', transcript)}
                      language="en-US"
                      size="icon"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Salary Structure</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="basicSalary">Basic Salary (INR) *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="basicSalary"
                          type="number"
                          value={newEmployee.basicSalary}
                          onChange={(e) => setNewEmployee({ ...newEmployee, basicSalary: e.target.value })}
                          placeholder="50000"
                        />
                        <VoiceInput
                          onTranscript={(transcript) => handleVoiceInput('basicSalary', transcript)}
                          language="en-US"
                          size="icon"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hra">HRA (INR)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="hra"
                          type="number"
                          value={newEmployee.hra}
                          onChange={(e) => setNewEmployee({ ...newEmployee, hra: e.target.value })}
                          placeholder="20000"
                        />
                        <VoiceInput
                          onTranscript={(transcript) => handleVoiceInput('hra', transcript)}
                          language="en-US"
                          size="icon"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="da">DA (INR)</Label>
                      <Input
                        id="da"
                        type="number"
                        value={newEmployee.da}
                        onChange={(e) => setNewEmployee({ ...newEmployee, da: e.target.value })}
                        placeholder="5000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transportAllowance">Transport (INR)</Label>
                      <Input
                        id="transportAllowance"
                        type="number"
                        value={newEmployee.transportAllowance}
                        onChange={(e) => setNewEmployee({ ...newEmployee, transportAllowance: e.target.value })}
                        placeholder="3000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="medicalAllowance">Medical (INR)</Label>
                      <Input
                        id="medicalAllowance"
                        type="number"
                        value={newEmployee.medicalAllowance}
                        onChange={(e) => setNewEmployee({ ...newEmployee, medicalAllowance: e.target.value })}
                        placeholder="2000"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddEmployeeOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEmployee}>
                  Add Employee
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isProcessPayrollOpen} onOpenChange={setIsProcessPayrollOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Calculator className="h-4 w-4" />
                Process Payroll
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Process Monthly Payroll</DialogTitle>
                <DialogDescription>
                  Calculate salaries and statutory deductions for all employees
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Payroll Processing</AlertTitle>
                  <AlertDescription>
                    This will calculate salaries, EPF, ESI, professional tax, and TDS for all active employees for the current month.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <strong>Month:</strong> {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Total Employees:</strong> 0 (Demo Mode)
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsProcessPayrollOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleProcessPayroll}>
                  Process Payroll
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Demo Mode</AlertTitle>
        <AlertDescription>
          Payroll management is in demo mode. Connect the backend to manage employees, process salaries, and generate statutory compliance reports.
        </AlertDescription>
      </Alert>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="salary-register">Salary Register</TabsTrigger>
          <TabsTrigger value="statutory-compliance">Statutory Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Employee Master Data
              </CardTitle>
              <CardDescription>
                Manage employee information and salary structures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No employees added yet</p>
                <p className="text-sm mt-2">Click "Add Employee" to get started</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salary-register" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Salary Register</CardTitle>
              <CardDescription>
                View and manage monthly salary calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No payroll processed yet</p>
                <p className="text-sm mt-2">Process payroll to generate salary register</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statutory-compliance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  EPF Returns
                </CardTitle>
                <CardDescription>
                  Employee Provident Fund monthly returns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Current Month EPF</p>
                    <p className="text-2xl font-bold">{formatINR(0)}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleExportStatutoryReturns('EPF')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  ESI Returns
                </CardTitle>
                <CardDescription>
                  Employee State Insurance monthly returns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Current Month ESI</p>
                    <p className="text-2xl font-bold">{formatINR(0)}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleExportStatutoryReturns('ESI')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Professional Tax
                </CardTitle>
                <CardDescription>
                  State-wise professional tax deductions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Current Month PT</p>
                    <p className="text-2xl font-bold">{formatINR(0)}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleExportStatutoryReturns('Professional Tax')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  TDS on Salary
                </CardTitle>
                <CardDescription>
                  Tax deducted at source and Form 16
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Current Month TDS</p>
                    <p className="text-2xl font-bold">{formatINR(0)}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleExportStatutoryReturns('TDS')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
