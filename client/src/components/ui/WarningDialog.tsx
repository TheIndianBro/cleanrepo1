import { useAppStore } from "../../zustand/store";

interface WarningDialogProps {
  onAccept?: () => void; // Keep this optional for backward compatibility
}

export function WarningDialog({ onAccept }: WarningDialogProps): JSX.Element {
  const { hideWarning, startGame } = useAppStore();

  const handleAccept = (): void => {
    // Use Zustand actions directly
    hideWarning();
    startGame();
    
    // Still call the callback if provided (for any additional logic in App.tsx)
    if (onAccept) {
      onAccept();
    }
  };

  return (
    <div 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div 
        style={{
          backgroundColor: "#1a1a1a",
          padding: "2rem",
          borderRadius: "8px",
          border: "2px solid #E1CF48",
          maxWidth: "500px",
          textAlign: "center",
          color: "#ffffff",
        }}
      >
        <h2 style={{ color: "#ff0000", marginBottom: "1rem" }}>
        BlockRooms V0
        </h2>
        <p style={{ marginBottom: "1.5rem", lineHeight: "1.6" }}>
         This FPS gameplay is at a POC stage. Any preassumptions or gameplay expectations are not final and are subject to change.
        </p>
        <button
          onClick={handleAccept}
          style={{
            backgroundColor: "#ff0000",
            color: "#ffffff",
            border: "none",
            padding: "12px 24px",
            borderRadius: "4px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#cc0000";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "#E1CF48";
          }}
        >
          I UNDERSTAND - START GAME
        </button>
      </div>
    </div>
  );
}