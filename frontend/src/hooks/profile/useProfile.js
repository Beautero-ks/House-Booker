import { useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useAuth } from '../useAuth';
import { GET_CURRENT_USER_QUERY } from '../../services/profile/queries';
import {
  UPDATE_PROFILE_MUTATION,
  CHANGE_PASSWORD_MUTATION,
  DELETE_ACCOUNT_MUTATION,
} from '../../services/profile/mutations';
import { setStoredUser } from '../../utils/tokenStorage';

export const useProfile = () => {
  const { user: authUser, refreshCurrentUser, logout } = useAuth();

  const { data, loading, error, refetch } = useQuery(GET_CURRENT_USER_QUERY, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  });

  const [updateProfileMutation] = useMutation(UPDATE_PROFILE_MUTATION);
  const [changePasswordMutation] = useMutation(CHANGE_PASSWORD_MUTATION);
  const [deleteAccountMutation] = useMutation(DELETE_ACCOUNT_MUTATION);

  const user = useMemo(() => data?.getCurrentUser || authUser, [data, authUser]);

  const updateProfile = async (input) => {
    const { data: result } = await updateProfileMutation({ variables: { input } });
    const updated = result?.updateProfile;
    if (!updated) {
      throw new Error('Impossible de mettre à jour le profil');
    }

    setStoredUser(updated);
    if (refreshCurrentUser) {
      await refreshCurrentUser();
    }
    await refetch();
    return updated;
  };

  const changePassword = async (input) => {
    const { data: result } = await changePasswordMutation({ variables: { input } });
    const response = result?.changePassword;
    if (!response) {
      throw new Error('Impossible de changer le mot de passe');
    }
    return response;
  };

  const deleteAccount = async (input) => {
    const { data: result } = await deleteAccountMutation({ variables: { input } });
    const response = result?.deleteAccount;
    if (!response) {
      throw new Error('Impossible de supprimer le compte');
    }
    if (response.success) {
      logout();
    }
    return response;
  };

  return {
    user,
    loading,
    error,
    refetch,
    updateProfile,
    changePassword,
    deleteAccount,
  };
};
