import React, { useState, useEffect } from 'react';
import {
  Paper, Box, Stack, Typography, Button, TextField, InputAdornment,
  IconButton, CircularProgress, Alert, Pagination, Divider, Container,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  Clear as ClearIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

import UserForm from '../components/user/UserForm';
import UserDetail from '../components/user/UserDetail';
import UserTable from '../components/user/UserTable';
import { useUsers } from '../hooks/useUsers';

const UsersPage = () => {
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    userId: null,
    userName: ''
  });

  const {
    users,
    currentUser,
    setCurrentUser,
    selectedUser,
    setSelectedUser,
    searchText,
    setSearchText,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    loading,
    error,
    showEditForm,
    setShowEditForm,
    showDetails,
    setShowDetails,
    fetchData,
    submit,
    remove
  } = useUsers();

  const handleSearch = () => {
    fetchData(1, searchText);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchText('');
    fetchData(1, '');
  };

  const handleDelete = async () => {
    if (deleteDialog.userId) {
      const result = await remove(deleteDialog.userId);
      if (result.success) {
        setDeleteDialog({ open: false, userId: null, userName: '' });
      }
    }
  };

  useEffect(() => {
    fetchData(1, '');
  }, [fetchData]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, maxWidth: '100%' }}>
        {showEditForm ? (
          <UserForm
            user={currentUser}
            onCancel={() => {
              setShowEditForm(false);
              setCurrentUser(null);
            }}
            onSubmit={submit}
            loading={loading}
          />
        ) : showDetails && selectedUser ? (
          <UserDetail
            user={selectedUser}
            onClose={() => {
              setShowDetails(false);
              setSelectedUser(null);
            }}
            onEdit={() => {
              setCurrentUser(selectedUser);
              setShowDetails(false);
              setShowEditForm(true);
            }}
          />
        ) : (
          <>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Box>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Usuarios</Typography>
                <Typography variant="body2" color="text.secondary">Total: {totalItems} usuarios</Typography>
              </Box>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowEditForm(true)}>
                Nuevo Usuario
              </Button>
            </Stack>

            <TextField
              label="Buscar usuarios..."
              fullWidth
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {searchText && <IconButton onClick={clearSearch} size="small"><ClearIcon /></IconButton>}
                    <IconButton onClick={handleSearch} size="small"><SearchIcon /></IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 3 }}
            />

            <Divider sx={{ mb: 3 }} />

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {loading ? (
              <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Cargando usuarios...</Typography>
              </Stack>
            ) : users.length === 0 ? (
              <Alert severity="info">No hay usuarios registrados.</Alert>
            ) : (
              <>
                <UserTable
                  users={users}
                  onEdit={(user) => {
                    setCurrentUser(user);
                    setShowEditForm(true);
                  }}
                  onDelete={(id) => {
                    const user = users.find(u => u.id === id);
                    setDeleteDialog({ open: true, userId: id, userName: user?.username });
                  }}
                  onDetail={(user) => {
                    setSelectedUser(user);
                    setShowDetails(true);
                  }}
                />
                
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={(e, page) => {
                        setCurrentPage(page);
                        fetchData(page, searchText);
                      }}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </>
        )}
      </Paper>

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, userId: null, userName: '' })}>
        <DialogTitle><WarningIcon color="warning" /> Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Eliminar usuario "{deleteDialog.userName}"?</Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>Esta acción no se puede deshacer.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, userId: null, userName: '' })}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" disabled={loading}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UsersPage;