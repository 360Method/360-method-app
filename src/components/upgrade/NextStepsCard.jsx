import React, { useState } from 'react';
import { 
  Building2, Share2, FileText, Hammer, 
  MapPin, AlertCircle, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isServiceAvailable, extractZipFromAddress } from '../shared/serviceAreas';
import RequestOperatorQuoteDialog from './RequestOperatorQuoteDialog';
import ShareProjectDialog from './ShareProjectDialog';
import ExportProjectDialog from './ExportProjectDialog';
import JoinWaitlistDialog from './JoinWaitlistDialog';

export default function NextStepsCard({ project, property, onNavigateToMilestones }) {
  const [showOperatorDialog, setShowOperatorDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showWaitlistDialog, setShowWaitlistDialog] = useState(false);

  // Get property zip code
  const propertyZip = property?.zip_code || extractZipFromAddress(property?.address);

  // Check if 360° Operator serves this property's zip code
  const serviceCheck = isServiceAvailable(propertyZip);
  const operatorAvailable = serviceCheck.available;
  const operatorName = serviceCheck.operatorName || '360° Operator';
  const serviceArea = serviceCheck.areaName || '';

  // Check if user has already requested operator quote
  const operatorQuoteRequested = project.operator_quote_requested;

  return (
    <>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-4 sm:p-6 mb-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🎯</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900">Next Steps</h3>
        </div>

        <p className="text-sm text-gray-700 mb-4">
          Ready to get started? Choose how you want to proceed:
        </p>

        <div className="space-y-3">
          {/* OPTION 1: 360° Operator - ONLY IF AVAILABLE IN ZIP CODE */}
          {operatorAvailable ? (
            <button
              onClick={() => setShowOperatorDialog(true)}
              className="w-full bg-white border-2 border-blue-300 rounded-xl p-4 hover:bg-blue-50 transition-all text-left"
              style={{ minHeight: '80px' }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-gray-900 text-sm sm:text-base">
                      Request {operatorName} Quote
                    </p>
                    {operatorQuoteRequested && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">
                    {operatorQuoteRequested 
                      ? 'Quote requested - we\'ll contact you within 24 hours'
                      : 'Professional 360° service with member discount pricing'
                    }
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span>Serving {serviceArea}</span>
                  </div>
                </div>
              </div>
            </button>
          ) : (
            /* NO OPERATOR AVAILABLE - Show Expanding Soon Message */
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-amber-900 mb-1 text-sm sm:text-base">
                    360° Operator Coming Soon
                  </p>
                  <p className="text-xs sm:text-sm text-amber-800 mb-2">
                    Professional service isn't available in your area yet, but we're expanding!
                  </p>
                  {propertyZip && (
                    <div className="flex items-center gap-1 text-xs text-amber-700 mb-3">
                      <MapPin className="w-3 h-3" />
                      <span>Not yet serving zip code {propertyZip}</span>
                    </div>
                  )}
                  <Button
                    size="sm"
                    onClick={() => setShowWaitlistDialog(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white mb-2"
                    style={{ minHeight: '40px' }}
                  >
                    Join Waitlist for Your Area
                  </Button>
                  <p className="text-xs text-amber-700">
                    💡 Meanwhile, you can share with local contractors below
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* OPTION 2: Share with Contractors (ALWAYS AVAILABLE) */}
          <button
            onClick={() => setShowShareDialog(true)}
            className="w-full bg-white border-2 border-gray-300 rounded-xl p-4 hover:bg-gray-50 transition-all text-left"
            style={{ minHeight: '80px' }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <Share2 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 mb-1 text-sm sm:text-base">
                  Share with Contractors
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Email project details to get multiple quotes
                </p>
              </div>
            </div>
          </button>

          {/* OPTION 3: Export/Print (ALWAYS AVAILABLE) */}
          <button
            onClick={() => setShowExportDialog(true)}
            className="w-full bg-white border-2 border-gray-300 rounded-xl p-4 hover:bg-gray-50 transition-all text-left"
            style={{ minHeight: '80px' }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 mb-1 text-sm sm:text-base">
                  Export Project Details
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Download PDF, print, or save for permits
                </p>
              </div>
            </div>
          </button>

          {/* OPTION 4: DIY (ALWAYS AVAILABLE) */}
          <button
            onClick={onNavigateToMilestones}
            className="w-full bg-white border-2 border-gray-300 rounded-xl p-4 hover:bg-gray-50 transition-all text-left"
            style={{ minHeight: '80px' }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <Hammer className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 mb-1 text-sm sm:text-base">
                  DIY - Manage It Yourself
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Follow step-by-step milestones and track progress
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Dialogs */}
      {operatorAvailable && (
        <RequestOperatorQuoteDialog
          project={project}
          property={property}
          operatorName={operatorName}
          serviceArea={serviceArea}
          isOpen={showOperatorDialog}
          onClose={() => setShowOperatorDialog(false)}
        />
      )}

      <JoinWaitlistDialog
        zipCode={propertyZip}
        isOpen={showWaitlistDialog}
        onClose={() => setShowWaitlistDialog(false)}
      />

      <ShareProjectDialog
        project={project}
        property={property}
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
      />

      <ExportProjectDialog
        project={project}
        property={property}
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
      />
    </>
  );
}