import { useQuery } from "@tanstack/react-query";
import useAuthStore from "@/store/useAuthStore";
import axios from "@/api/axios";

export interface Permissions {
  userId: string;
  role: string;
  schoolId: string | null;
  can: {
    // Global permissions
    manageAll: boolean;
    viewAll: boolean;
    
    // School management
    manageSchools: boolean;
    manageOwnSchool: boolean;
    viewSchools: boolean;
    
    // Team management
    manageTeams: boolean;
    manageOwnTeams: boolean;
    viewTeams: boolean;
    
    // Player management
    managePlayers: boolean;
    manageOwnProfile: boolean;
    viewPlayers: boolean;
    
    // Coach management
    manageCoaches: boolean;
    viewCoaches: boolean;
    
    // Match management
    manageMatches: boolean;
    viewMatches: boolean;
    
    // Judge management
    manageJudges: boolean;
    viewJudges: boolean;
    
    // Sponsor management
    manageSponsors: boolean;
    viewSponsors: boolean;
    
    // School admin management
    manageSchoolAdmins: boolean;
    viewSchoolAdmins: boolean;
    
    // Challenge management
    manageChallenges: boolean;
    viewChallenges: boolean;
    
    // Arena management
    manageArenas: boolean;
    viewArenas: boolean;
  };
}

/**
 * Hook to get user permissions
 */
export const usePermissions = () => {
  const { user, isAuthenticated } = useAuthStore();

  const { data: permissions, isLoading } = useQuery<Permissions>({
    queryKey: ["userPermissions", user?.id],
    queryFn: async () => {
      const response = await axios.get("/api/auth/permissions");
      return response.data;
    },
    enabled: isAuthenticated && !!user?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  /**
   * Check if user can perform an action on a resource
   */
  const can = (action: string, resourceId?: string) => {
    if (!permissions) return false;
    
    // Admin can do everything
    if (permissions.can.manageAll) return true;

    // Check specific permissions
    switch (action) {
      case "manage:school":
        return permissions.can.manageSchools || permissions.can.manageOwnSchool;
      case "manage:team":
        return permissions.can.manageTeams || permissions.can.manageOwnTeams;
      case "manage:player":
        return permissions.can.managePlayers || permissions.can.manageOwnProfile;
      case "manage:coach":
        return permissions.can.manageCoaches;
      case "manage:match":
        return permissions.can.manageMatches;
      case "manage:judge":
        return permissions.can.manageJudges;
      case "manage:sponsor":
        return permissions.can.manageSponsors;
      case "manage:school_admin":
        return permissions.can.manageSchoolAdmins;
      case "manage:challenge":
        return permissions.can.manageChallenges;
      case "manage:arena":
        return permissions.can.manageArenas;
      case "view:school":
        return permissions.can.viewSchools;
      case "view:team":
        return permissions.can.viewTeams;
      case "view:player":
        return permissions.can.viewPlayers;
      case "view:coach":
        return permissions.can.viewCoaches;
      case "view:match":
        return permissions.can.viewMatches;
      case "view:judge":
        return permissions.can.viewJudges;
      case "view:sponsor":
        return permissions.can.viewSponsors;
      case "view:school_admin":
        return permissions.can.viewSchoolAdmins;
      case "view:challenge":
        return permissions.can.viewChallenges;
      case "view:arena":
        return permissions.can.viewArenas;
      default:
        return false;
    }
  };

  /**
   * Check if user can manage a specific resource
   */
  const canManage = async (resourceType: string, resourceId: string) => {
    if (!permissions) return false;
    if (permissions.can.manageAll) return true;

    try {
      const response = await axios.get(
        `/api/permissions/check/${resourceType}/${resourceId}`
      );
      return response.data.allowed;
    } catch (error) {
      return false;
    }
  };

  return {
    permissions,
    isLoading,
    can,
    canManage,
    isAdmin: permissions?.can.manageAll || false,
    isSchoolAdmin: permissions?.role === "school_admin" || false,
    isCoach: permissions?.role === "coach" || false,
    isJudge: permissions?.role === "judge" || false,
    isPlayer: permissions?.role === "player" || false,
  };
};

