import { useTheme } from "../providers/ThemeProvider";
import { Token, TransferLimitResponse } from "../send/types";

export function TransferLimit({ transferLimit, selectedToken }: { transferLimit: TransferLimitResponse | undefined, selectedToken: Partial<Token> | null }) {
  const { theme } = useTheme();

  return (
    <div className="transfer-limits-container" style={{ 
      marginTop: 16, 
      padding: 16,
      borderRadius: 8, 
      backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6',
      border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
    }}>
      <div className="transfer-limit-header" style={{
        marginBottom: '12px',
        fontWeight: '600',
        fontSize: '14px',
        color: theme === 'dark' ? '#e5e7eb' : '#374151'
      }}>
        Transfer Limits
      </div>
      <div className="transfer-limit-item" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 8,
        padding: '6px 0'
      }}>
        <span style={{ fontSize: 14, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
          Min. Transfer Amount:
        </span>
        <span style={{ 
          fontWeight: 600, 
          fontSize: 14, 
          backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
          padding: '4px 8px',
          borderRadius: '4px',
          color: theme === 'dark' ? '#e5e7eb' : '#374151'
        }}>
          {new Intl.NumberFormat("id-ID", { maximumFractionDigits: 10 }).format(parseFloat(transferLimit?.tokenLimits?.minTokenAmount || transferLimit?.minTransferAmount || "0"))} {selectedToken?.symbol?.toUpperCase()}
        </span>
      </div>
      <div className="transfer-limit-item" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '6px 0'
      }}>
        <span style={{ fontSize: 14, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
          Max. Transfer Amount:
        </span>
        <span style={{ 
          fontWeight: 600, 
          fontSize: 14,
          backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
          padding: '4px 8px',
          borderRadius: '4px',
          color: theme === 'dark' ? '#e5e7eb' : '#374151'
        }}>
          {new Intl.NumberFormat("id-ID", { maximumFractionDigits: 10 }).format(parseFloat(transferLimit?.tokenLimits?.maxTokenAmount || transferLimit?.maxTransferAmount || "0"))} {selectedToken?.symbol?.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
  