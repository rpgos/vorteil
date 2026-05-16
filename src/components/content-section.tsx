import Image from 'next/image';

type Props = {
  title: string;
  subtitle: string;
  imageUrl?: string;
  imageSide?: 'left' | 'right';
  variant?: 'primary' | 'secondary';
  children?: React.ReactNode;
};

export default function ContentSection({
  title,
  subtitle,
  imageUrl,
  imageSide = 'left',
  variant = 'primary',
  children,
}: Props) {
  const bg = variant === 'secondary' ? 'bg-border' : '';

  if (!imageUrl) {
    return (
      <section className={`px-6 py-20 ${bg}`}>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">{title}</h2>
          <p className="mt-4 text-lg text-default-500">{subtitle}</p>
          {children && (
            <div className="mt-6 flex flex-col md:flex-row gap-2 items-center justify-center">{children}</div>
          )}
        </div>
      </section>
    );
  }

  const imageEl = (
    <div className="relative h-72 w-full overflow-hidden rounded-2xl md:h-full md:min-h-80">
      <Image src={imageUrl} alt="" fill className="object-cover" />
    </div>
  );

  const textEl = (
    <div className="flex flex-col justify-center">
      <h2 className="text-3xl font-bold md:text-4xl">{title}</h2>
      <p className="mt-4 text-lg text-default-500">{subtitle}</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );

  return (
    <section className={`px-6 py-20 ${bg}`}>
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 md:gap-16">
        {imageSide === 'left' ? (
          <>
            {imageEl}
            {textEl}
          </>
        ) : (
          <>
            {textEl}
            {imageEl}
          </>
        )}
      </div>
    </section>
  );
}
