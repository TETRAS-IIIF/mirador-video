import { render, screen } from '@tests/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { AnnotationsFilter } from '@src/components/AnnotationFilter';

describe('AnnotationsFilter', () => {
  const t = (key) => key;

  it('shows the search field with its search button', () => {
    render(<AnnotationsFilter availableTags={[]} setInputSearch={() => {}} setTagsSearch={() => {}} t={t} />);

    expect(screen.getByLabelText('searchPlaceholderAnnotation')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'searchAnnotationTooltip' })).toBeInTheDocument();
  });

  it('passes the typed text on', async () => {
    const setInputSearch = vi.fn();
    render(<AnnotationsFilter availableTags={[]} setInputSearch={setInputSearch} setTagsSearch={() => {}} t={t} />);

    await userEvent.type(screen.getByLabelText('searchPlaceholderAnnotation'), 'a');

    expect(setInputSearch).toHaveBeenCalledWith('a');
  });
});
