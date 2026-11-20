"use client"
import { useContext, useMemo, useState } from "react";
import Button from "@/components/primary/Button";
import { 
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/seondary/card";
// import { Tabs } from "@/components/seondary/tabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/seondary/tabs";
// import { Badge } from "@/components/ui/badge";
import {
  Users,
  Twitter,
  MessageCircle,
  Heart,
  Gamepad2,
  Trophy,
  Share2,
  Clock,
  Star,
  CheckCircle,
  Copy,
} from "lucide-react";
import HomeLayout from "@/components/layouts/home-layout";
import TaskCard from "@/components/seondary/task-card";
import { appContext } from "@/contexts/appContext";
import { IDailyTasks, IStarterTasks } from "../../../api-feature/types";
import ProtectLayout from "@/components/layouts/protect-layout";

export type TuserTaskId = "connect-twitter" | "connect-discord" | "join-discord" | "follow-twitter" | "engage-post" | "play-5-games" | "try-3-games" | "word-of-day"

export interface TaskType {
  id: keyof IStarterTasks | keyof IDailyTasks;
  title: string;
  description: string;
  reward: number;
  icon: React.ComponentType<any>;
  completed?: boolean;
  link?: string;
  progress?: { current: number; total: number };
}

const dailyTasks: TaskType[] = [
  {
    id: "play_five_games",
    title: "Play 5 Games",
    description: "Complete 5 games of any type today",
    reward: 1,
    icon: Gamepad2,
    progress: { current: 2, total: 5 },
  },
  {
    id: "three_different_games",
    title: "Try 3 Different Games",
    description: "Exlore, play different game ",
    reward: 1,
    icon: Star,
    progress: { current: 1, total: 3 },
  },
  {
    id: "word_of_day",
    title: "Word of the day",
    description: "Get the word of the day",
    reward: 0.5,
    icon: Trophy,
    completed: false,
  },
];

const specialTasks: TaskType[] = [
  // {
  //   id: "maze-runner",
  //   title: "Maze Runner Challenge",
  //   description:
  //     "Complete the maze game 10 times this week. Top performers win bonus rewards!",
  //   reward: 500,
  //   icon: Clock,
  //   progress: { current: 3, total: 10 },
  // },
  // {
  //   id: "retro-week",
  //   title: "Retro Gaming Week",
  //   description: "Play all 5 featured games during Retro Week event",
  //   reward: 1000,
  //   icon: Gamepad2,
  //   progress: { current: 2, total: 5 },
  // },
  // {
  //   id: "community-challenge",
  //   title: "Community High Score Challenge",
  //   description: "Help the community reach 1M total points this month",
  //   reward: 300,
  //   icon: Users,
  //   progress: { current: 750000, total: 1000000 },
  // },
];

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState("starter");
  const {userProfile, syncUserProfile} = useContext(appContext)
  const {dailyTasks: dailyData, starterTasks: starterData, referralCode} = userProfile
  const [isCopied, setIsCopied] = useState(false)

  const copyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      !isCopied && setIsCopied(true)
      // In a real app, you'd show a toast notification here
    }
  };


  const starterTasks: TaskType[] = useMemo(() => [
    {
      id: "connect_twitter",
      title: "Connect Twitter Account",
      description: "Link your Twitter account to unlock social features",
      reward: starterData?.connect_twitter?.reward ?? 0,
      icon: Twitter,
      link: "https://x.com/Caleb76015407",
      completed: starterData?.connect_twitter.completed,
    },
    {
      id: "connect_discord",
      title: "Connect Discord Account",
      description: "Connect Discord to join our community",
      reward: starterData?.connect_discord?.reward ?? 0,
      icon: MessageCircle,
      link: "https://x.com/Caleb76015407",
      completed: starterData?.connect_discord?.completed,
    },
    {
      id: "joined_discord",
      title: "Join Our Discord",
      description: "Become part of the Chain Play community",
      reward: starterData?.joined_discord?.reward ?? 0,
      icon: MessageCircle,
      link: "https://x.com/Caleb76015407",
      completed: starterData?.joined_discord?.completed,
    },
    {
      id: "followed_twitter",
      title: "Follow @ChainPlayArcade",
      description: "Stay updated with the latest news and updates",
      reward: starterData?.followed_twitter?.reward ?? 0,
      icon: Twitter,
      link: "https://x.com/Caleb76015407",
      completed: starterData?.followed_twitter?.completed,
    },
    {
      id: "engaged_twitter_post",
      title: "Like & Retweet Our Pinned Post",
      description: "Show some love to our latest announcement",
      reward: starterData?.engaged_twitter_post?.reward ?? 0,
      icon: Heart,
      link: "https://x.com/Caleb76015407",
      completed: starterData?.engaged_twitter_post?.completed,
    },
  ], [starterData]);

  return (
    <HomeLayout>
      <ProtectLayout>
        <div className="text-[#9f9fa8] flex flex-col items-center min-h-screen pt-24 pb-16">
            <div className="fixed inset-0 grid-bg opacity-30" />
            {/* <div className="scanline" /> */}
            <div className="w-[90%] min-[982px]:w-[900px] min-[1269px]:w-[70%] z-[2]">
                <h1 className="text-4xl font-bold tracking-tight mb-3 text-center neon-purple">
                    Tasks
                </h1>
                <p className="text-center text-cyan-300 mb-10">
                    Complete tasks to grow
                </p>

                {/* Referral Section */}
                <Card className="retro-card mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <Users className="h-6 w-6 text-primary" />
                              <CardTitle className="text-xl neon-cyan">
                                  Invite Friends
                              </CardTitle>
                            </div>
                            {/* <p>Referral count: {userProfile?.referralsCount ?? "null"}</p> */}
                        </div>
                        <CardDescription className="text-base">
                            Invite your friends to Chain Play
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        {referralCode ? (
                            <div className="flex-1 flex items-center gap-2 p-3 bg-muted/20 rounded-lg border w-full border-primary/30">
                            <code className="flex-1 font-mono text-lg text-primary">
                                {referralCode}
                            </code>
                            <Button
                              // variant="ghost"
                              // size="sm"
                              onClick={copyReferralCode}
                              className="hover:bg-primary/20"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            </div>
                        ) : (
                            <div className="flex-1">
                            <p className="text-muted-foreground mb-3">
                                Get your unique referral code
                            </p>
                            </div>
                        )}
                        <Button
                          className="retro-button whitespace-nowrap w-full sm:w-auto"
                          onClick={copyReferralCode}
                        >
                            {isCopied ? "Copied!" : "Referral Code"}
                        </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Tasks Sections */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 bg-background">
                        <TabsTrigger
                        value="starter"
                        className=" data-[state=active]:bg-primary data-[state=active]:text-white py-2 px-1 cursor-pointer"
                        >
                            Starter Tasks
                        </TabsTrigger>
                        {/* <TabsTrigger
                        value="daily"
                        className=" data-[state=active]:bg-primary data-[state=active]:text-white py-2 cursor-pointer"
                        >
                            Daily Tasks
                        </TabsTrigger> */}
                        <TabsTrigger
                        value="special"
                        className=" data-[state=active]:bg-primary data-[state=active]:text-white py-2 cursor-pointer"
                        >
                          Special Tasks
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="starter" className="space-y-4">
                        <div className="mb-4">
                        <h2 className="text-2xl font-semibold mb-2 neon-purple">
                            Starter Tasks
                        </h2>
                        <p className="text-muted-foreground">
                            Complete these one-time tasks to get started and start earning points
                        </p>
                        </div>
                        <div className="grid gap-4 min-[986px]:grid-cols-2">
                        {starterTasks?.map((task) => (
                            <TaskCard syncXp={syncUserProfile} type="starter" key={task.id} task={task} />
                        ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="daily" className="space-y-4">
                        <div className="mb-4">
                        <h2 className="text-2xl font-semibold mb-2 neon-purple">
                            Daily Tasks
                        </h2>
                        <p className="text-muted-foreground">
                            Fresh challenges every day! Complete these tasks to grow your xp
                        </p>
                        </div>
                        <div className="grid gap-4 min-[986px]:grid-cols-2">
                        {dailyTasks?.map((task) => (
                            <TaskCard syncXp={syncUserProfile} type="daily" key={task.id} task={task} />
                        ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="special" className="space-y-4">
                        <div className="mb-4">
                        <h2 className="text-2xl font-semibold mb-2 neon-purple">
                            Special Tasks
                        </h2>
                        <p className="text-muted-foreground">
                            Limited-time events and challenges with exclusive rewards
                        </p>
                        </div>
                        <div className="grid gap-4">
                        {/* {specialTasks?.map((task) => (
                            <TaskCard key={task.id} task={task} />
                        ))} */}
                          <p className="text-center py-8">No Special Tasks Available</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
      </ProtectLayout>
    </HomeLayout>
  );
}
