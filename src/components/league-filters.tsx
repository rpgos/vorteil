'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Select, ListBox } from '@heroui/react';

type Props = {
  cities: string[];
  labels: {
    filterCity: string;
    filterStatus: string;
    filterAllCities: string;
    filterAllStatuses: string;
    statusOpen: string;
    statusInSeason: string;
    statusPlayoffs: string;
    statusFinished: string;
  };
};

const STATUS_OPTIONS = ['open', 'in_season', 'playoffs', 'finished'] as const;

export function LeagueFilters({ cities, labels }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`);
  }

  const statusLabels: Record<string, string> = {
    open: labels.statusOpen,
    in_season: labels.statusInSeason,
    playoffs: labels.statusPlayoffs,
    finished: labels.statusFinished,
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Select
        aria-label={labels.filterCity}
        selectedKey={params.get('city') ?? ''}
        onSelectionChange={key => update('city', key as string)}
        className="w-44"
      >
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            <ListBox.Item id="" textValue={labels.filterAllCities}>
              {labels.filterAllCities}
              <ListBox.ItemIndicator />
            </ListBox.Item>
            {cities.map(city => (
              <ListBox.Item key={city} id={city} textValue={city}>
                {city}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>

      <Select
        aria-label={labels.filterStatus}
        selectedKey={params.get('status') ?? ''}
        onSelectionChange={key => update('status', key as string)}
        className="w-44"
      >
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            <ListBox.Item id="" textValue={labels.filterAllStatuses}>
              {labels.filterAllStatuses}
              <ListBox.ItemIndicator />
            </ListBox.Item>
            {STATUS_OPTIONS.map(s => (
              <ListBox.Item key={s} id={s} textValue={statusLabels[s]}>
                {statusLabels[s]}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
    </div>
  );
}
