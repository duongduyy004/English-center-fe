import { COLORS } from './colors';

export const commonStyles = {
  // Layout styles
  pageContainer: {
    minHeight: '100vh',
    background: '#f7f9fb',
    paddingLeft: '3vw',
    paddingRight: '3vw',
    boxSizing: 'border-box',
  },
  contentContainer: {
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    p: 5,
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 3,
  },
  pageTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: COLORS.text,
  },

  // Table styles
  tableContainer: {
    mt: 2,
    '& .MuiTableCell-head': {
      backgroundColor: '#f8f9fa',
      fontWeight: 600,
      color: COLORS.text,
      whiteSpace: 'nowrap',
    },
    '& .MuiTableCell-body': {
      fontSize: '0.875rem',
    },
  },
  tableRow: {
    '&:hover': {
      backgroundColor: '#f8f9fa',
    },
  },
  actionCell: {
    width: '120px',
    textAlign: 'center',
  },

  // Form styles
  formContainer: {
    p: 5,
  },
  formGrid: {
    mt: 2,
  },
  formField: {
    mb: 2,
  },
  formActions: {
    mt: 3,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 2,
  },

  // Button styles
  primaryButton: {
    bgcolor: COLORS.primary,
    color: 'white',
    '&:hover': {
      bgcolor: COLORS.primaryDark,
    },
  },
  secondaryButton: {
    bgcolor: 'white',
    color: COLORS.text,
    border: '1px solid #ddd',
    '&:hover': {
      bgcolor: '#f5f5f5',
    },
  },

  // Dialog styles
  dialogTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: COLORS.text,
    pb: 2,
  },
  dialogContent: {
    minWidth: '500px',
  },

  // Search and filter styles
  searchContainer: {
    mb: 3,
    p: 2,
    backgroundColor: 'white',
    borderRadius: 1,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  searchField: {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'white',
    },
  },
  filterSelect: {
    minWidth: '200px',
  },
};
