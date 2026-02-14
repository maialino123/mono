# Change: Update Stake Page with Hero Section and Pill Badges

## Why

The `/stake` page currently shows only the TVL chart and a placeholder stake panel. The design requires a hero section with a title ("Every CUSD is backed by real assets in Treasury") and three pill badges ("1:1 Backed", "On Base", "Fully On-chain") above the chart grid to communicate CUSD's value proposition.

## What Changes

- Add hero section with centered title above the TVL chart grid
- Add three pill badges below the title: "1:1 Backed", "On Base", "Fully On-chain"
- Apply custom title typography: 30px, semibold, -0.75% letter-spacing, primary color, centered
- Apply custom pill typography: 14px, regular, secondary color, rounded border
- Responsive design: hero + pills center on all breakpoints, grid stacks on mobile
- Stake panel remains "coming soon" placeholder
- "Customize" button is excluded

## Impact

- Affected specs: `staking-chart` (minor: page layout expanded)
- Affected code: `apps/web/src/screens/stake/ui/stake-screen.tsx` (1 file)
