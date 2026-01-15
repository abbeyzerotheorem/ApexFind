
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SavedHomes from "@/components/dashboard/saved-homes";
import { Heart, Search, User } from "lucide-react";

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
                 <div className="mt-8 text-center py-24 bg-secondary rounded-lg">
                    <h2 className="text-2xl font-semibold">Coming Soon</h2>
                    <p className="text-muted-foreground mt-2">Manage your saved searches and get alerts for new properties.</p>
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
