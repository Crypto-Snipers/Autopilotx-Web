import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { UsersRound } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, Send } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast";
import Lowheader from "@/components/Lowheader";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { apiRequest } from "@/lib/queryClient"
import { useLocation } from "wouter"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AdminUser {
  is_admin: boolean
  name: string
}

export default function AdminNotificationPage() {
  const [notification, setNotification] = useState({
    title: "",
    message: "",
    target_filter: "all",
    user_email: "",
    strategy_name: "",
    start_time: new Date(),
    platform: "both",
    notification_type: "info",
  })

  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [_, navigate] = useLocation()
  const handleTargetFilterChange = (value: string) => {
    setNotification({
      ...notification,
      target_filter: value,
      user_email: value === "specific_user" ? notification.user_email : "",
      strategy_name: value === "specific_strategy" ? notification.strategy_name : ""
    })
  }


  // Check admin access if a user tried to access this page directly
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const email = sessionStorage.getItem('signupEmail') || '';
        const res = await apiRequest<{ success: boolean; email: string; role: string; }>(
          "GET",
          `/api/get-role?email=${encodeURIComponent(email)}`
        );

        if (res?.role !== "superadmin" && res?.role !== "admin") {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access the admin dashboard.",
            variant: "destructive",
          });
          navigate("/home");
          return;
        }

        setCurrentUser({
          is_admin: res.role === "admin" || res.role === "superadmin",
          name: res.email, // or use res.name if available
        });
      } catch (err) {
        console.error("Auth check failed:", err);
        setCurrentUser({ is_admin: true, name: "Admin" }); // fallback, remove if not intended
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkAdminAccess();
  }, [navigate, toast]);


  const handleSendNotification = async () => {
    const notificationData = {
      title: notification.title,
      message: notification.message,
      target_filter: notification.target_filter,
      user_email: notification.target_filter === "specific_user" ? notification.user_email : undefined,
      strategy_name: notification.target_filter === "specific_strategy" ? notification.strategy_name : undefined,
      start_time: notification.start_time.toISOString(),
      platform: notification.platform,
      notification_type: notification.notification_type,
    }

    try {
      const result = await apiRequest("POST", `/api/notifications`, notificationData);
      console.log("Notification created:", result);

      toast({
        title: "Success",
        description: "Notification sent successfully!",
        className: "bg-green-100 border-green-500 text-green-800",
      });

      // Reset form
      setNotification({
        title: "",
        message: "",
        target_filter: "all",
        user_email: "",
        strategy_name: "",
        start_time: new Date(),
        platform: "both",
        notification_type: "info",
      })
    } catch (error: any) {
      console.error("Error while sending notification:", error.message);
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }

  }
  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-[#2d3139]">
      <Sidebar />

      <div className="flex-1 md:ml-[14rem]">
        <Header />
        <div className="hidden md:block"><Lowheader /></div>
        <div>
          <div className="container mx-auto p-6 space-y-6">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-semibold text-start">
                Notification Dashboard
              </h1>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Notification Details</CardTitle>
                <CardDescription>
                  Configure your notification settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={notification.title}
                    onChange={(e) =>
                      setNotification({
                        ...notification,
                        title: e.target.value,
                      })
                    }
                    placeholder="Enter notification title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={notification.message}
                    onChange={(e) =>
                      setNotification({
                        ...notification,
                        message: e.target.value,
                      })
                    }
                    placeholder="Enter notification message"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="notification_type">Notification Type</Label>
                    <Select
                      value={notification.notification_type}
                      onValueChange={(value) =>
                        setNotification({
                          ...notification,
                          notification_type: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target_filter">Target Filter</Label>
                    <Select
                      value={notification.target_filter}
                      onValueChange={handleTargetFilterChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select target filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="pending">Pending Users</SelectItem>
                        <SelectItem value="approved">Approved Users</SelectItem>
                        <SelectItem value="approved_broker">
                          Approved Broker Users
                        </SelectItem>
                        <SelectItem value="pending_broker">
                          Pending Broker Users
                        </SelectItem>
                        <SelectItem value="approved_broker_low_balance">
                          Approved Broker Users with Low Balance
                        </SelectItem>
                        <SelectItem value="strategy_any">
                          Users with Any Strategy
                        </SelectItem>
                        <SelectItem value="specific_strategy">
                          Specific Strategy
                        </SelectItem>
                        <SelectItem value="specific_user">
                          Specific User
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* <div className="space-y-2">
                    <Label htmlFor="platform">Platform</Label>
                    <Select
                      value={notification.platform}
                      onValueChange={(value) => setNotification({ ...notification, platform: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="web">Web</SelectItem>
                        <SelectItem value="mobile">Mobile</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div> */}
                </div>

                {notification.target_filter === "specific_user" && (
                  <div className="space-y-2">
                    <Label htmlFor="user_email">User Email</Label>
                    <Input
                      id="user_email"
                      type="email"
                      value={notification.user_email}
                      onChange={(e) =>
                        setNotification({
                          ...notification,
                          user_email: e.target.value,
                        })
                      }
                      placeholder="Enter user email"
                    />
                  </div>
                )}

                {notification.target_filter === "specific_strategy" && (
                  <div className="space-y-2">
                    <Label htmlFor="strategy_name">Strategy Name</Label>
                    <Input
                      id="strategy_name"
                      value={notification.strategy_name}
                      onChange={(e) =>
                        setNotification({
                          ...notification,
                          strategy_name: e.target.value,
                        })
                      }
                      placeholder="Enter strategy name"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Notification Post On</Label>
                  <div className="flex items-center space-x-2 border border-gray-200 dark:border-gray-700 rounded p-2">
                    <CalendarIcon className="h-4 w-4" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {format(new Date(), "PPP")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-start">
              <Button
                onClick={handleSendNotification}
                disabled={
                  !notification.title ||
                  !notification.message ||
                  (notification.target_filter === "specific_user" &&
                    !notification.user_email) ||
                  (notification.target_filter === "specific_strategy" &&
                    !notification.strategy_name)
                }
                className="min-w-32 cursor-pointer bg-[#1a785f] hover:bg-[#1e896d]"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Notification
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


