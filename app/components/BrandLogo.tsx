import Image from "next/image";

export default function BrandLogo({ priority = false, className = "" }: { priority?: boolean; className?: string }) {
  return <span className={`brand-logo ${className}`.trim()} aria-hidden="true">
    <Image
      src="/images/sabzino-logo.png"
      alt=""
      width={900}
      height={600}
      sizes="(max-width: 600px) 120px, 155px"
      priority={priority}
    />
  </span>;
}
