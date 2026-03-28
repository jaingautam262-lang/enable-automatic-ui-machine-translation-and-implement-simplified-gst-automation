import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Building2,
  FileText,
  Scale,
  Search,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

interface TaxProvision {
  section: string;
  title: string;
  description: string;
  category: "income-tax" | "gst" | "companies-act";
}

const TAX_PROVISIONS: TaxProvision[] = [
  {
    section: "Section 80C",
    title: "Deduction for Life Insurance, PPF, etc.",
    description:
      "Deduction up to ₹1,50,000 for investments in specified instruments including life insurance premiums, PPF, ELSS, NSC, etc.",
    category: "income-tax",
  },
  {
    section: "Section 80D",
    title: "Deduction for Medical Insurance",
    description:
      "Deduction for health insurance premiums paid for self, family, and parents. Up to ₹25,000 for self/family and additional ₹25,000 for parents.",
    category: "income-tax",
  },
  {
    section: "Section 194C",
    title: "TDS on Contractor Payments",
    description:
      "TDS at 1% (individual/HUF) or 2% (others) on payments to contractors exceeding ₹30,000 in a single payment or ₹1,00,000 in aggregate.",
    category: "income-tax",
  },
  {
    section: "Section 12 GST",
    title: "Time of Supply of Goods",
    description:
      "Determines when GST liability arises for supply of goods - earliest of invoice date, payment receipt, or goods removal.",
    category: "gst",
  },
  {
    section: "Section 16 GST",
    title: "Input Tax Credit",
    description:
      "Conditions for claiming input tax credit including possession of tax invoice, receipt of goods/services, and filing of returns.",
    category: "gst",
  },
  {
    section: "Section 149",
    title: "Company Secretary",
    description:
      "Certain classes of companies must appoint a whole-time company secretary who is a member of ICSI.",
    category: "companies-act",
  },
  {
    section: "Section 177",
    title: "Audit Committee",
    description:
      "Listed companies and certain other companies must constitute an Audit Committee with minimum 3 directors and 2/3rd independent directors.",
    category: "companies-act",
  },
];

export default function AITaxResearchTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "income-tax" | "gst" | "companies-act"
  >("all");

  const filteredProvisions = TAX_PROVISIONS.filter((provision) => {
    const matchesSearch =
      searchQuery === "" ||
      provision.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provision.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provision.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || provision.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          AI-Powered Tax Research
        </h2>
        <p className="text-muted-foreground">
          Intelligent legal insights across Income Tax, GST, and Companies Act
        </p>
      </div>

      <Card className="border-primary/20 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-950/80 dark:to-purple-950/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Tax Provisions
          </CardTitle>
          <CardDescription>
            Search across Income Tax Act, GST Act, and Companies Act with
            AI-powered cross-referencing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search by section, keyword, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={selectedCategory}
        onValueChange={(v) => setSelectedCategory(v as any)}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Provisions</TabsTrigger>
          <TabsTrigger value="income-tax">
            <Scale className="h-4 w-4 mr-2" />
            Income Tax
          </TabsTrigger>
          <TabsTrigger value="gst">
            <FileText className="h-4 w-4 mr-2" />
            GST
          </TabsTrigger>
          <TabsTrigger value="companies-act">
            <Building2 className="h-4 w-4 mr-2" />
            Companies Act
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          <ScrollArea className="h-[600px] rounded-md border p-4">
            {filteredProvisions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No provisions found matching your search</p>
                <p className="text-sm mt-2">
                  Try different keywords or browse all provisions
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProvisions.map((provision, index) => (
                  <Card
                    // biome-ignore lint/suspicious/noArrayIndexKey: stable list
                    key={index}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {provision.section}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {provision.title}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {provision.category === "income-tax" && (
                            <Scale className="h-3 w-3" />
                          )}
                          {provision.category === "gst" && (
                            <FileText className="h-3 w-3" />
                          )}
                          {provision.category === "companies-act" && (
                            <Building2 className="h-3 w-3" />
                          )}
                          <span className="ml-1">
                            {provision.category === "income-tax" &&
                              "Income Tax"}
                            {provision.category === "gst" && "GST"}
                            {provision.category === "companies-act" &&
                              "Companies Act"}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {provision.description}
                      </p>
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="outline">
                          <BookOpen className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI Analysis
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="font-semibold">Cross-Referencing</h3>
              <p className="text-sm text-muted-foreground">
                Automatically find related provisions across different acts
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Compliance Checking</h3>
              <p className="text-sm text-muted-foreground">
                Verify compliance requirements for your transactions
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Smart Recommendations</h3>
              <p className="text-sm text-muted-foreground">
                Get AI-powered suggestions for tax optimization
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
