import { NavbarClient } from './navbar.client';
// import { http } from '@/libs/apiClient';
// import { User } from './types';



// export async function getProfileData(userId: string): Promise<User> {
//     return http.get(`/api/v1/users/${userId}/profile`);
// }

export function NavbarServer() {
  return <NavbarClient />;
}