import { SignedIn, SignedOut } from "@clerk/nextjs";
const hello = () => {
  return (
    <div>
      <SignedOut>
        <h2>hellooooo oooo</h2>
      </SignedOut>
      <SignedIn>
        <h2>hellooo i am signed in</h2>
      </SignedIn>
    </div>
  );
};

export default hello;
