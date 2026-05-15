import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ContentSection from './content-section';

describe('ContentSection', () => {
  it('renders title and subtitle', () => {
    render(<ContentSection title="Join a League" subtitle="Find your city's league" />);
    expect(screen.getByText('Join a League')).toBeInTheDocument();
    expect(screen.getByText("Find your city's league")).toBeInTheDocument();
  });

  it('renders centered layout when no imageUrl is provided', () => {
    const { container } = render(<ContentSection title="Rankings" subtitle="See where you stand" />);
    expect(container.querySelector('.text-center')).toBeInTheDocument();
  });

  it('does not render an img when no imageUrl is provided', () => {
    render(<ContentSection title="Rankings" subtitle="See where you stand" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders an image when imageUrl is provided', () => {
    const { container } = render(
      <ContentSection
        title="Track Matches"
        subtitle="Keep your records"
        imageUrl="https://images.unsplash.com/photo-123"
      />
    );
    expect(container.querySelector('img')).toBeInTheDocument();
  });

  it('renders children under the subtitle', () => {
    render(
      <ContentSection title="Title" subtitle="Subtitle">
        <button>Click me</button>
      </ContentSection>
    );
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('image appears first when imageSide is left', () => {
    const { container } = render(
      <ContentSection
        title="Title"
        subtitle="Subtitle"
        imageUrl="https://images.unsplash.com/photo-123"
        imageSide="left"
      />
    );
    const grid = container.querySelector('.grid');
    const children = Array.from(grid!.children);
    // first child is the image wrapper (contains img), second is the text
    expect(children[0].querySelector('img')).toBeInTheDocument();
    expect(children[1].querySelector('img')).not.toBeInTheDocument();
  });

  it('image appears second when imageSide is right', () => {
    const { container } = render(
      <ContentSection
        title="Title"
        subtitle="Subtitle"
        imageUrl="https://images.unsplash.com/photo-123"
        imageSide="right"
      />
    );
    const grid = container.querySelector('.grid');
    const children = Array.from(grid!.children);
    expect(children[0].querySelector('img')).not.toBeInTheDocument();
    expect(children[1].querySelector('img')).toBeInTheDocument();
  });
});
