import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/AuthContext';
import {
  Building,
  Play,
  CheckCircle,
  Lock,
  Clock,
  BookOpen,
  Video,
  FileText,
  Award,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Loader2
} from 'lucide-react';

export default function OperatorTraining() {
  const navigate = useNavigate();
  const { user, isAuthenticated, getActiveRoleProfile } = useAuth();
  const [currentModule, setCurrentModule] = useState(null);
  const [completedModules, setCompletedModules] = useState(['module-1']); // Mock completed

  const modules = [
    {
      id: 'module-1',
      title: 'Introduction to 360° Method',
      description: 'Learn the core philosophy and approach of the 360° Method for property care',
      duration: '15 min',
      type: 'video',
      lessons: [
        { id: '1-1', title: 'What is the 360° Method?', duration: '5 min', completed: true },
        { id: '1-2', title: 'The 9-Step Framework', duration: '5 min', completed: true },
        { id: '1-3', title: 'Property Health Scores', duration: '5 min', completed: true }
      ]
    },
    {
      id: 'module-2',
      title: 'Client Onboarding',
      description: 'How to onboard new property owners and set up their property profiles',
      duration: '20 min',
      type: 'video',
      lessons: [
        { id: '2-1', title: 'Initial Client Consultation', duration: '7 min', completed: false },
        { id: '2-2', title: 'Property Baseline Setup', duration: '8 min', completed: false },
        { id: '2-3', title: 'Creating Service Plans', duration: '5 min', completed: false }
      ]
    },
    {
      id: 'module-3',
      title: 'Using the Operator Dashboard',
      description: 'Master the CRM tools, scheduling, and client management features',
      duration: '25 min',
      type: 'video',
      lessons: [
        { id: '3-1', title: 'Dashboard Overview', duration: '5 min', completed: false },
        { id: '3-2', title: 'Client Management', duration: '7 min', completed: false },
        { id: '3-3', title: 'Scheduling & Calendar', duration: '7 min', completed: false },
        { id: '3-4', title: 'Invoicing & Payments', duration: '6 min', completed: false }
      ]
    },
    {
      id: 'module-4',
      title: 'Working with Contractors',
      description: 'How to recruit, onboard, and manage your contractor network',
      duration: '20 min',
      type: 'video',
      lessons: [
        { id: '4-1', title: 'Finding Quality Contractors', duration: '6 min', completed: false },
        { id: '4-2', title: 'Contractor Onboarding', duration: '7 min', completed: false },
        { id: '4-3', title: 'Job Assignment & Tracking', duration: '7 min', completed: false }
      ]
    },
    {
      id: 'module-5',
      title: 'Service Excellence',
      description: 'Delivering exceptional service and building long-term client relationships',
      duration: '15 min',
      type: 'video',
      lessons: [
        { id: '5-1', title: 'Communication Best Practices', duration: '5 min', completed: false },
        { id: '5-2', title: 'Handling Issues & Complaints', duration: '5 min', completed: false },
        { id: '5-3', title: 'Building Client Trust', duration: '5 min', completed: false }
      ]
    },
    {
      id: 'module-6',
      title: 'Certification Exam',
      description: 'Complete the final assessment to earn your 360° Method Operator certification',
      duration: '30 min',
      type: 'exam',
      lessons: [
        { id: '6-1', title: 'Final Assessment (25 questions)', duration: '30 min', completed: false }
      ]
    }
  ];

  const totalModules = modules.length;
  const completedCount = completedModules.length;
  const progressPercent = Math.round((completedCount / totalModules) * 100);

  const isModuleUnlocked = (moduleId) => {
    const moduleIndex = modules.findIndex(m => m.id === moduleId);
    if (moduleIndex === 0) return true;
    const previousModule = modules[moduleIndex - 1];
    return completedModules.includes(previousModule.id);
  };

  const handleStartModule = (moduleId) => {
    setCurrentModule(moduleId);
  };

  const handleCompleteModule = (moduleId) => {
    if (!completedModules.includes(moduleId)) {
      setCompletedModules([...completedModules, moduleId]);
    }
    setCurrentModule(null);

    // Check if all modules are complete
    if (completedModules.length + 1 === totalModules) {
      // Navigate to certification complete
      navigate('/OperatorPending?status=certified');
    }
  };

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/Login?redirect_url=/OperatorTraining');
    return null;
  }

  // Module Detail View
  if (currentModule) {
    const module = modules.find(m => m.id === currentModule);

    return (
      <div className="min-h-screen bg-gray-900">
        {/* Video Header */}
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <button
              onClick={() => setCurrentModule(null)}
              className="flex items-center gap-2 text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Course
            </button>
            <div className="text-white font-medium">{module.title}</div>
            <Button
              size="sm"
              onClick={() => handleCompleteModule(currentModule)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Complete
            </Button>
          </div>
        </header>

        {/* Video Player Area */}
        <div className="bg-black aspect-video max-w-5xl mx-auto flex items-center justify-center">
          <div className="text-center text-gray-400">
            <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Video Player Placeholder</p>
            <p className="text-sm">Training video would play here</p>
          </div>
        </div>

        {/* Lesson List */}
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h3 className="text-white font-semibold mb-4">Lessons</h3>
          <div className="space-y-2">
            {module.lessons.map((lesson, idx) => (
              <div
                key={lesson.id}
                className={`flex items-center gap-4 p-4 rounded-lg ${
                  lesson.completed ? 'bg-green-900/20' : 'bg-gray-800'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  lesson.completed ? 'bg-green-600' : 'bg-gray-700'
                }`}>
                  {lesson.completed ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : (
                    <span className="text-white text-sm">{idx + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">{lesson.title}</div>
                  <div className="text-gray-400 text-sm">{lesson.duration}</div>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-400">
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Course Overview
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/OperatorPending" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-orange-500" />
            <span className="font-semibold text-gray-900">Operator Training</span>
          </div>
          <Badge className="bg-orange-100 text-orange-700">
            {completedCount}/{totalModules} Complete
          </Badge>
        </div>
      </header>

      {/* Progress Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">360° Method Certification</h1>
              <p className="text-orange-100">Complete all modules to earn your certification badge</p>
            </div>
          </div>
          <div className="bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-orange-100">
            <span>{progressPercent}% Complete</span>
            <span>{totalModules - completedCount} modules remaining</span>
          </div>
        </div>
      </div>

      {/* Modules List */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {modules.map((module, idx) => {
            const isComplete = completedModules.includes(module.id);
            const isUnlocked = isModuleUnlocked(module.id);
            const isExam = module.type === 'exam';

            return (
              <Card
                key={module.id}
                className={`p-6 transition-all ${
                  !isUnlocked ? 'opacity-60' : ''
                } ${isComplete ? 'border-green-200 bg-green-50/50' : ''}`}
              >
                <div className="flex items-start gap-4">
                  {/* Module Number/Status */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isComplete
                      ? 'bg-green-500 text-white'
                      : isUnlocked
                      ? isExam ? 'bg-purple-500 text-white' : 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isComplete ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : !isUnlocked ? (
                      <Lock className="w-5 h-5" />
                    ) : isExam ? (
                      <FileText className="w-6 h-6" />
                    ) : (
                      <span className="text-lg font-bold">{idx + 1}</span>
                    )}
                  </div>

                  {/* Module Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{module.title}</h3>
                      {isExam && (
                        <Badge className="bg-purple-100 text-purple-700">Exam</Badge>
                      )}
                      {isComplete && (
                        <Badge className="bg-green-100 text-green-700">Completed</Badge>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{module.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {module.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {module.lessons.length} {module.lessons.length === 1 ? 'lesson' : 'lessons'}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex-shrink-0">
                    {isComplete ? (
                      <Button
                        variant="outline"
                        onClick={() => handleStartModule(module.id)}
                      >
                        Review
                      </Button>
                    ) : isUnlocked ? (
                      <Button
                        onClick={() => handleStartModule(module.id)}
                        className={isExam ? 'bg-purple-600 hover:bg-purple-700' : 'bg-orange-500 hover:bg-orange-600'}
                      >
                        {isExam ? 'Take Exam' : 'Start'}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    ) : (
                      <Button variant="outline" disabled>
                        <Lock className="w-4 h-4 mr-2" />
                        Locked
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Completion CTA */}
        {completedCount === totalModules && (
          <Card className="mt-8 p-8 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <Award className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Congratulations!
            </h2>
            <p className="text-gray-600 mb-6">
              You've completed all training modules. Your certification is being processed.
            </p>
            <Button
              onClick={() => navigate('/OperatorDashboard')}
              className="bg-green-600 hover:bg-green-700"
            >
              Go to Operator Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
