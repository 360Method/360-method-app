import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Copy, Check, Code, ExternalLink } from 'lucide-react';

export default function EmbedCodeGenerator({ operator }) {
  const [copied, setCopied] = useState(false);
  const [height, setHeight] = useState('500');
  const [width, setWidth] = useState('100%');

  const baseUrl = window.location.origin;
  const embedUrl = `${baseUrl}/embed/${operator?.slug || 'your-slug'}`;

  const iframeCode = `<iframe
  src="${embedUrl}"
  width="${width}"
  height="${height}px"
  frameborder="0"
  style="border: none; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
  title="Request a Quote"
></iframe>`;

  const scriptCode = `<div id="360-lead-form"></div>
<script>
(function() {
  var iframe = document.createElement('iframe');
  iframe.src = '${embedUrl}';
  iframe.width = '${width}';
  iframe.height = '${height}';
  iframe.frameBorder = '0';
  iframe.style.border = 'none';
  iframe.style.borderRadius = '8px';
  iframe.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
  document.getElementById('360-lead-form').appendChild(iframe);

  // Listen for form submission
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === '360_LEAD_SUBMITTED') {
      console.log('Lead submitted:', e.data.leadId);
      // Add your tracking code here (Google Analytics, etc.)
    }
  });
})();
</script>`;

  const copyToClipboard = (code, type) => {
    navigator.clipboard.writeText(code);
    setCopied(type);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!operator?.slug) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <Code className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="font-medium">Set up your URL slug first</p>
          <p className="text-sm mt-1">You need to configure a URL slug in your profile settings to generate embed codes.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Code className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Embed Lead Form</h3>
          <p className="text-sm text-gray-500">Add this form to your website to capture leads</p>
        </div>
      </div>

      {/* Preview Link */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900">Preview your form</p>
            <p className="text-xs text-blue-700 truncate">{embedUrl}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(embedUrl, '_blank')}
            className="gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Preview
          </Button>
        </div>
      </div>

      {/* Size Settings */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <Label>Width</Label>
          <Input
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            placeholder="100% or 400px"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Height (px)</Label>
          <Input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="500"
            className="mt-1"
          />
        </div>
      </div>

      {/* Simple Embed (iframe) */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <Label>Simple Embed (iframe)</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(iframeCode, 'iframe')}
            className="gap-2"
          >
            {copied === 'iframe' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied === 'iframe' ? 'Copied!' : 'Copy'}
          </Button>
        </div>
        <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg text-xs overflow-x-auto">
          {iframeCode}
        </pre>
      </div>

      {/* Advanced Embed (script) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Advanced Embed (with tracking)</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(scriptCode, 'script')}
            className="gap-2"
          >
            {copied === 'script' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied === 'script' ? 'Copied!' : 'Copy'}
          </Button>
        </div>
        <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap">
          {scriptCode}
        </pre>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">How to use</h4>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>Copy the embed code above</li>
          <li>Paste it into your website's HTML where you want the form</li>
          <li>Leads will automatically appear in your pipeline</li>
        </ol>
      </div>
    </Card>
  );
}
