import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { LawSubject } from '../../features/studies/types';
import CourseItemCompact from './CourseItemCompact';
import CourseItemExpanded from './CourseItemExpanded';

interface CourseListProps {
  subjects: LawSubject[];
  onEdit: (subject: LawSubject) => void;
  onDelete: (subject: LawSubject) => void;
  onStudy: (subject: LawSubject) => void;
}

const CourseList: React.FC<CourseListProps> = ({
  subjects,
  onEdit,
  onDelete,
  onStudy,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {subjects.map((subject, index) => {
        const isExpanded = expandedId === subject.id;

        return (
          <div key={subject.id}>
            <CourseItemCompact
              subject={subject}
              index={index}
              isExpanded={isExpanded}
              onToggle={() => setExpandedId((current) => (current === subject.id ? null : subject.id))}
              onEdit={() => onEdit(subject)}
              onDelete={() => onDelete(subject)}
              onStudy={() => onStudy(subject)}
            />

            <AnimatePresence initial={false}>
              {isExpanded ? (
                <CourseItemExpanded
                  subject={subject}
                  onEdit={() => onEdit(subject)}
                  onDelete={() => onDelete(subject)}
                  onStudy={() => onStudy(subject)}
                />
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default CourseList;
