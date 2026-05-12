import { use } from 'react'
import { setRequestLocale, getTranslations } from 'next-intl/server'

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
    <main className="flex flex-1 flex-col items-center justify-center">
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
      <p>{t('description')}</p>
    </main>
  )
}
