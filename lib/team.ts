/**
 * Team shown on /projects.
 *
 * `placeholder: true` marks the entries carried over from the original site
 * ("Dr. Agricultural Expert" and so on). They are not real people. Replace
 * each with a real name, role and photo (`photo`: a path under /public) and
 * set `placeholder: false`. `pnpm launch:check` fails while any remain.
 */
export interface TeamMember {
  /** True for the invented entries from the original site. */
  placeholder: boolean
  name: string
  role: string
  description: string
  expertise: string
  /** Portrait path under /public, e.g. /images/team/ada.jpg. */
  photo?: string
}

export const TEAM: readonly TeamMember[] = [
  {
    placeholder: true,
    name: 'Dr. Agricultural Expert',
    role: 'Lead Agricultural Specialist',
    description: '20+ years in sustainable agriculture and crop management',
    expertise: 'Circular Economy, Crop Science',
  },
  {
    placeholder: true,
    name: 'Eng. Energy Systems',
    role: 'Renewable Energy Director',
    description: 'Expert in solar PV systems and green hydrogen technologies',
    expertise: 'Solar Energy, Green Hydrogen',
  },
  {
    placeholder: true,
    name: 'Prof. Research Lead',
    role: 'Research & Development Head',
    description:
      'Leading researcher in biomass gasification and biochar production',
    expertise: 'Biomass Technology, R&D',
  },
  {
    placeholder: true,
    name: 'Ms. Community Engagement',
    role: 'Capacity Building Manager',
    description:
      'Specialist in community training and gender inclusion programs',
    expertise: 'Training, Gender Inclusion',
  },
]
