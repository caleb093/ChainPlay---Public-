// import { TaskType, TuserTaskId } from "@/pages/tasks";
import { TaskType } from "@/app/tasks/page";
import { 
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/seondary/card";
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
import Button from "../primary/Button";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useLoading } from "@/util/hooks";
import { usePatchUserTaskVerifyMutation } from "../../../api-feature/apiSlice";
import toast from "react-hot-toast";
import Loading from "./Loading";

const TaskCard = ({ task, type, syncXp }: { task: TaskType, type: "starter" | "daily", syncXp: (updates: {xp: number}) => void }) => {
  const [verifyTask] = usePatchUserTaskVerifyMutation()
  const router = useRouter()
  const Icon = task?.icon;
  const [isCompleted, setIsCompleted] = useState(task?.completed ?? false)
  // const isCompleted = task?.completed;
  const hasProgress = task?.progress && !isCompleted;
  const [verify, setVerify] = useState(false)
  const {loading, startLoading, stopLoading} = useLoading()

  useEffect(() => {
    setIsCompleted(task?.completed ?? false)
  }, [task])

  const handleCardClick = () => {
    if (!isCompleted && !verify) 
      {
        type === "starter" && setVerify(true), 
        window.open(task?.link, "_blank")
      }
  }

  const handleVerifyTask = async () => {
    startLoading()
    if (!loading) {
      // Call Api to verify task
      try {
        const response = await verifyTask({taskType: type, taskName: task.id}).unwrap()
        setIsCompleted(true)
        setVerify(false)
        syncXp({xp: task.reward})
      } catch (error) {
        console.error(error)
        toast.error("Error verifying task")
      } finally{
        stopLoading()
      }
    }
  }

  return (
    <Card className="retro-card hover:retro-glow transition-all duration-300">
      <CardHeader className="pb-3 cursor-pointer" onClick={handleCardClick}>
        <div className="flex items-start gap-2 justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${isCompleted ? "bg-green-500/20" : "bg-primary/20"}`}
            >
              {isCompleted ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <Icon className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <CardTitle className="text-[1em] text-white">{task?.title}</CardTitle>
              <CardDescription className="text-[0.8em]">
                {task?.description}
              </CardDescription>
            </div>
          </div>
          <Button
            //   variant="secondary"
            // @ts-ignore
            onClick={() => {verify && handleVerifyTask()}}
            className={`${!verify ? "bg-primary/20 text-primary" : "bg-[#ff29c6] text-slate-200"} flex items-center text-[0.8em] px-4 py-1 border-primary/30`}
          >
            {loading && <Loading small />}
            {!loading && (verify ? "verify" : <span className="flex">+{task?.reward} <span className="pl-1">xp</span></span>)}
          </Button>
        </div>
      </CardHeader>
      {hasProgress && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>
                {task?.progress!.current}/{task?.progress!.total}
              </span>
            </div>
            <div className="w-full bg-muted/30 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(task?.progress!.current / task?.progress!.total) * 100}%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default React.memo(TaskCard)