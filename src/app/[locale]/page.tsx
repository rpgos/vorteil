import { use } from 'react'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import Image from 'next/image'
import NextLink from 'next/link'
import { buttonVariants } from '@heroui/react'

type Props = {
  params: Promise<{ locale: string }>
}

export default function HomePage({ params }: Props) {
  const { locale } = use(params)
  setRequestLocale(locale)

  return <HomePageContent />
}

async function HomePageContent() {
  const t = await getTranslations('Home')

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden">
      {/* Background image */}
      <Image src="/court1.jpg" alt="Tennis court" fill className="object-cover brightness-50" priority />

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">{t('title')}</h1>
        <p className="max-w-xl text-lg text-white/80">{t('description')}</p>
        <NextLink href="/login" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
          {t('cta')}
        </NextLink>
      </div>
    </main>
  )
}
