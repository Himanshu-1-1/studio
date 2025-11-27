'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface SkillsInputProps {
  value: string[];
  onChange: (skills: string[]) => void;
}

const popularSkills = [
  'JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'HTML', 'CSS', 'Java', 'TypeScript', 'AWS'
];

export function SkillsInput({ value, onChange }: SkillsInputProps) {
  const [inputValue, setInputValue] = React.useState('');

  const handleAddSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !value.includes(trimmedSkill)) {
      onChange([...value, trimmedSkill]);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill(inputValue);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    onChange(value.filter((skill) => skill !== skillToRemove));
  };

  return (
    <div className='space-y-4'>
      <Input
        placeholder="Add a skill and press Enter..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="flex flex-wrap gap-1">
        {popularSkills.map((skill) => (
          !value.includes(skill) && (
            <Button
              key={skill}
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleAddSkill(skill)}
            >
              + {skill}
            </Button>
          )
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {value.map((skill) => (
          <Badge key={skill} variant="secondary" className="text-sm py-1 pl-3 pr-2">
            {skill}
            <button
              type="button"
              onClick={() => handleRemoveSkill(skill)}
              className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
