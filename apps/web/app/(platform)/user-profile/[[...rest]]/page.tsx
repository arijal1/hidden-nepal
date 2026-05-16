import { UserProfile } from "@clerk/nextjs";

export default function UserProfilePage() {
  return (
    <div className="min-h-screen bg-base-950 pt-12 pb-24 px-5 flex justify-center">
      <UserProfile path="/user-profile" routing="path" />
    </div>
  );
}
