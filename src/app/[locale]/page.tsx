import { use } from 'react'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import Image from 'next/image'
import NextLink from 'next/link'
import { buttonVariants } from '@heroui/react'

type Props = {
  params: Promise<{ locale: string }>
}

const heroImagePaths = [
  'photo-1777996625863-8f9713811fb5',
  'photo-1777996625814-028201238572',
  'photo-1777996625750-b934896792b9',
]

export default function HomePage({ params }: Props) {
  const { locale } = use(params)
  setRequestLocale(locale)

  return <HomePageContent />
}

async function HomePageContent() {
  const t = await getTranslations('Home')

  const heroImage = heroImagePaths[Math.floor(Math.random() * heroImagePaths.length)]

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden">
      <Image
        src={`https://images.unsplash.com/${heroImage}`}
        alt="Tennis court"
        fill
        className="object-cover brightness-50"
        priority
      />

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        <h1 className="font-groovello text-5xl font-bold tracking-tight sm:text-7xl">{t('title')}</h1>
        <p className="max-w-xl text-lg">{t('description')}</p>
        <NextLink href="/login" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
          {t('cta')}
        </NextLink>
      </div>
    </main>
  )
}
