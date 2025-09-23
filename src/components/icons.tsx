import { Home, Shield, LucideProps } from 'lucide-react';

export const Icons = {
  logo: (props: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 10.5v6c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-6" />
      <path d="M12 2L2 10.5l10 8.5 10-8.5L12 2z" />
      <path d="M12 22V15" />
    </svg>
  ),
  home: Home,
  shield: Shield,
};
