/* CRITICAL: Solid background styling for all modals and popups */
/* Applied system-wide to ensure readability and proper visual hierarchy */

/* Modal Overlay - Dark semi-opaque background */
[data-radix-dialog-overlay] {
  background-color: rgba(0, 0, 0, 0.75) !important;
  backdrop-filter: none !important;
}

/* Modal Content Card - Solid white background */
[data-radix-dialog-content] {
  background-color: #FFFFFF !important;
  opacity: 1 !important;
  border-radius: 8px !important;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15) !important;
  padding: 24px !important;
}

/* Ensure all dialog headers are solid white */
[data-radix-dialog-content] [role="dialog"] > div:first-child,
.dialog-header,
[class*="DialogHeader"] {
  background-color: #FFFFFF !important;
  opacity: 1 !important;
}

/* Dialog title styling */
[data-radix-dialog-title],
.dialog-title,
[class*="DialogTitle"] {
  color: #1B365D !important;
  font-size: 24px !important;
  font-weight: 700 !important;
  background-color: transparent !important;
}

/* Dialog body content */
[data-radix-dialog-content] > div {
  background-color: #FFFFFF !important;
  opacity: 1 !important;
}

/* Form inputs in dialogs */
[data-radix-dialog-content] input,
[data-radix-dialog-content] textarea,
[data-radix-dialog-content] select {
  background-color: #FFFFFF !important;
  border: 1px solid #CCCCCC !important;
  color: #333333 !important;
  opacity: 1 !important;
}

[data-radix-dialog-content] input:focus,
[data-radix-dialog-content] textarea:focus,
[data-radix-dialog-content] select:focus {
  border-color: #FF6B35 !important;
  outline: none !important;
}

/* Buttons in dialogs */
[data-radix-dialog-content] button {
  opacity: 1 !important;
}

/* Select dropdowns */
[data-radix-select-content] {
  background-color: #FFFFFF !important;
  opacity: 1 !important;
  border-radius: 8px !important;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15) !important;
}

/* Popover content */
[data-radix-popover-content] {
  background-color: #FFFFFF !important;
  opacity: 1 !important;
  border-radius: 8px !important;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15) !important;
}

/* Dropdown menu content */
[data-radix-dropdown-menu-content] {
  background-color: #FFFFFF !important;
  opacity: 1 !important;
  border-radius: 8px !important;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15) !important;
}

/* Sheet/Sidebar overlays */
[data-radix-sheet-overlay] {
  background-color: rgba(0, 0, 0, 0.75) !important;
}

[data-radix-sheet-content] {
  background-color: #FFFFFF !important;
  opacity: 1 !important;
}

/* Cards used as modals */
.modal-card,
.popup-card,
.form-card {
  background-color: #FFFFFF !important;
  opacity: 1 !important;
  border-radius: 8px !important;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15) !important;
}

/* Ensure no transparency on any modal/popup backgrounds */
[role="dialog"],
[role="alertdialog"],
[data-state="open"][data-radix-dialog-content] {
  background-color: #FFFFFF !important;
  opacity: 1 !important;
}

/* Fix any glass morphism or backdrop blur */
.backdrop-blur,
[class*="backdrop-blur"] {
  backdrop-filter: none !important;
}

/* Ensure solid backgrounds for all form sections */
form > div,
.form-section,
.form-group {
  background-color: #FFFFFF !important;
  opacity: 1 !important;
}