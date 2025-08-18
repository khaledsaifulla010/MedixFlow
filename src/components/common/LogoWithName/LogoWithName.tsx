import Image from "next/image";

const LogoWithName = () => {
  return (
    <div className="flex items-center justify-center mt-44 gap-4">
      <div className="block dark:hidden">
        <Image
          src="/logo.png"
          alt="MedixFlow Logo"
          width={50}
          height={50}
          priority
        />
      </div>
      <div className="hidden dark:block">
        <Image
          src="/logo1.png"
          alt="MedixFlow Logo Dark"
          width={50}
          height={50}
          priority
        />
      </div>
      <h1 className="text-5xl font-black text-center">
        MedixFlow Healthcare System
      </h1>
    </div>
  );
};

export default LogoWithName;
