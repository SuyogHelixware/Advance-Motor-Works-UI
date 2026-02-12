import { useMemo } from "react";
import useAuth from "../../Routing/AuthContext";

export default function usePermissions(menuId) {
  const { user } = useAuth();

  return useMemo(() => {
    const matchedMenu = user?.SubMenus?.flatMap(sub =>
      sub.Menus.filter(menu => menu.MenuId === menuId)
    )[0];

    return matchedMenu || {
      IsRead: false,
      IsAdd: false,
      IsEdit: false,
      IsDelete: false,
    };
  }, [user, menuId]);
}
