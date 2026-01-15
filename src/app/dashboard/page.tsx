
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SavedHomes from "@/components/dashboard/saved-homes";
import { Heart, Search, User, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-grow py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            My Dashboard
          </h1>
          <Tabs defaultValue="saved-homes" className="mt-8">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 max-w-2xl">
              <TabsTrigger value="saved-homes">
                <Heart className="mr-2 h-4 w-4" />
                Saved Homes
              </TabsTrigger>
              <TabsTrigger value="saved-searches">
                <Search className="mr-2 h-4 w-4" />
                Saved Searches
              </TabsTrigger>
              <TabsTrigger value="profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </TabsTrigger>
            </TabsList>
            <TabsContent value="saved-homes">
                <SavedHomes />
            </TabsContent>
            <TabsContent value="saved-searches">
                 <div className="mt-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl font-bold">You have 2 saved searches</h2>
                            <p className="text-muted-foreground">Manage your alerts and get notified about new properties.</p>
                        </div>
                        <Button>+ Create New Search</Button>
                    </div>
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-start gap-4">
                                <div>
                                    <CardTitle className="text-xl">Downtown Condos</CardTitle>
                                    <CardDescription className="pt-2">Lagos, NG • ₦150,000,000 - ₦300,000,000 • 2+ Beds</CardDescription>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Switch id="alert-1" />
                                    <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                </div>
                            </CardHeader>
                            <CardFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <Button variant="secondary">See 3 new matches</Button>
                                <p className="text-sm text-muted-foreground">Alert Frequency: Daily</p>
                            </CardFooter>
                        </Card>
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-start gap-4">
                                <div>
                                    <CardTitle className="text-xl">Abuja Family Homes</CardTitle>
                                    <CardDescription className="pt-2">Abuja, NG • Under ₦500,000,000 • 4+ Beds • Pool</CardDescription>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Switch id="alert-2" checked />
                                     <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                </div>
                            </CardHeader>
                             <CardFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <Button variant="secondary" disabled>No new matches</Button>
                                <p className="text-sm text-muted-foreground">Alert Frequency: Weekly</p>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </TabsContent>
             <TabsContent value="profile">
                 <div className="mt-8 text-center py-24 bg-secondary rounded-lg">
                    <h2 className="text-2xl font-semibold">Coming Soon</h2>
                    <p className="text-muted-foreground mt-2">Manage your profile and notification settings.</p>
                </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
