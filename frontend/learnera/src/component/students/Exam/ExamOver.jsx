import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, Clock, Mail } from 'lucide-react';

const ExamOver = () => {
    const navigate = useNavigate();

    return (
      <div className="max-w-2xl mx-auto p-6 min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 animate-ping bg-green-100 rounded-full" />
                <CheckCircle className="w-16 h-16 text-green-500 relative" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">
              Exam Submitted Successfully
            </h1>
            <p className="text-gray-600">
              Thank you for completing your exam
            </p>
          </CardHeader>
  
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
              <h2 className="font-medium text-blue-800 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                What happens next?
              </h2>
              <ul className="space-y-2 text-blue-700">
                <li>• Your answers have been securely recorded</li>
                <li>• The examination team will review your submission</li>
                <li>• Results will be published on your dashboard</li>
                <li>• You'll receive an email notification when grades are available</li>
              </ul>
            </div>
  
         
  
            <div className="flex justify-center pt-4 gap-4">
              <Button
                onClick={() => navigate('/students')}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

export default ExamOver;