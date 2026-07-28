/**
 * Public API of the `profile` feature (architecture.md). A **ui-only** feature:
 * the hub is a thin list of items that navigate by route path, so it has no
 * domain, application or infrastructure layer and nothing for the composition
 * root to wire — just the screen the `profile` route renders.
 */
export { ProfileScreen } from './ui/screens/Profile/ProfileScreen';
