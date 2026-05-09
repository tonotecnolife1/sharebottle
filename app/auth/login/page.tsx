import { redirect } from "next/navigation";

/**
 * Legacy login URL (pre URL-split). The 3 apps now have their own
 * login pages at /cast/auth/login, /store/auth/login,
 * /customer/auth/login. Redirect to the cast login as the default;
 * users can switch via the bottom switcher there.
 *
 * Old bookmarks / external links land here without a 404.
 */
export default function LoginRedirect() {
  redirect("/cast/auth/login");
}
