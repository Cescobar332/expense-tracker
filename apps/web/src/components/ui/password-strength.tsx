'use client';

interface PasswordStrengthProps {
  password: string;
  labels: {
    weak: string;
    fair: string;
    good: string;
    strong: string;
  };
}

function getPasswordScore(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&.,#^()_+\-=]/.test(password)) score++;
  return score;
}

export function PasswordStrength({ password, labels }: PasswordStrengthProps) {
  if (!password) return null;

  const score = getPasswordScore(password);

  const strengthConfig = [
    { label: labels.weak, color: 'var(--color-danger)' },
    { label: labels.fair, color: '#f97316' },
    { label: labels.good, color: '#eab308' },
    { label: labels.strong, color: 'var(--color-success)' },
  ];

  const { label, color } = strengthConfig[Math.max(score - 1, 0)];

  return (
    <div style={{ marginTop: '6px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
        {[1, 2, 3, 4].map((segment) => (
          <div
            key={segment}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              backgroundColor: segment <= score ? color : 'var(--color-text-secondary)',
              opacity: segment <= score ? 1 : 0.2,
              transition: 'background-color 0.3s, opacity 0.3s',
            }}
          />
        ))}
      </div>
      <p
        style={{
          fontSize: '12px',
          color,
          margin: 0,
          transition: 'color 0.3s',
        }}
      >
        {label}
      </p>
    </div>
  );
}
