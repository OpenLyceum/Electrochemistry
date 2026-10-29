# Electrochemistry: model

The chemistry behind the three screens, for teachers and developers. Everything is ideal:
activities equal molar concentrations, solids have activity 1, gases are at 1 atm, and standard
potentials do not change with temperature.

## Half-cells and standard potentials

Each half-cell is one reduction half-reaction ν Ox(aq) + n e⁻ → Red with its standard reduction
potential at 25 °C, from the CRC Handbook's *Electrochemical Series* (also in OpenStax
*Chemistry 2e*, Appendix L):

| Half-cell | Half-reaction | E° (V) | n | ν |
|---|---|---|---|---|
| Magnesium | Mg²⁺ + 2e⁻ → Mg | −2.372 | 2 | 1 |
| Aluminum | Al³⁺ + 3e⁻ → Al | −1.662 | 3 | 1 |
| Zinc | Zn²⁺ + 2e⁻ → Zn | −0.7618 | 2 | 1 |
| Iron | Fe²⁺ + 2e⁻ → Fe | −0.447 | 2 | 1 |
| Nickel | Ni²⁺ + 2e⁻ → Ni | −0.257 | 2 | 1 |
| Lead | Pb²⁺ + 2e⁻ → Pb | −0.1262 | 2 | 1 |
| Hydrogen (SHE) | 2H⁺ + 2e⁻ → H₂ | 0 | 2 | 2 |
| Copper | Cu²⁺ + 2e⁻ → Cu | +0.3419 | 2 | 1 |
| Silver | Ag⁺ + e⁻ → Ag | +0.7996 | 1 | 1 |

Simplifications: Mg would react with water and Al is passivated by its oxide layer, so real cells
with them give less than the tabulated potential. The hydrogen electrode is platinum with H₂ at
1 atm.

## Cell potential and the Nernst equation

Each electrode's potential is

  E = E° + (ν RT / nF) ln[Ox]

and the cell potential is E_cell = E_cathode − E_anode. For the overall reaction with
n = lcm(n_cathode, n_anode) electrons,

  E = E° − (RT / nF) ln Q,  Q = [Ox_anode]^(ν_a n / n_a) / [Ox_cathode]^(ν_c n / n_c)

which is the same thing (tested). At 25 °C the slope is 0.05916 V / n per decade of Q. Then

  ΔG = −nFE (kJ per mole of reaction as written),  log K = nFE° / (2.303 RT).

Constants: F = 96 485.332 12 C/mol and R = 8.314 462 618 J/(mol·K) (CODATA 2018).

Worked values the tests check: Daniell E° = 0.3419 − (−0.7618) = 1.104 V; ΔG° = −213 kJ/mol;
log K = 37.3; [Cu²⁺] = 0.010 M with [Zn²⁺] = 1 M gives E = 1.104 − 0.0296 × 2 = 1.045 V; a copper
concentration cell 0.010 M | 1.0 M gives 0.0592 V.

### Sign conventions on screen

- The voltmeter's black (COM) lead is on the left electrode and its red lead on the right, so it
  reads E_right − E_left. It reads 0 with the salt bridge out (open circuit).
- On the Galvanic Cell screen the anode and cathode follow the sign of that potential, so the
  reactions always describe what actually happens.
- On the Nernst screen the reaction is written with the left electrode as the anode. E, Q and ΔG
  are for the reaction as written, so E < 0 (Q > K) means the reverse reaction is spontaneous.

## Running the cell down

With the bulb connected and the salt bridge in, current flows:

  I = |E| / (R + R_MT / [Ox]_cathode),  R = 1 Ω,  R_MT = 0.2 Ω·M

R is the bulb, wires and solutions. R_MT / [Ox] stands for the cathode's ion having to reach the
electrode: it makes the current die away as that ion is used up. Without it a Daniell cell
would keep driving about 0.9 A with no Cu²⁺ left. In each time step the charge I·dt reduces
ν/n mol of the cathode's ion per mole of electrons and plates 1/n mol of metal. At the anode it
dissolves 1/n mol of metal into ν/n mol of ions. Each beaker holds 100 mL, and each electrode
starts at 10 g.

Consequences students can see:

- A Daniell cell keeps about 1.1 V until Cu²⁺ is nearly gone. The current then falls to zero
  while E stays near 0.9 V. E = 0 would need [Cu²⁺] ≈ 10⁻³⁷ M (Q = K), which no real cell
  reaches.
- A concentration cell runs until both concentrations are equal and E = 0, so Q = K = 1.

Time is scaled: 10 min, 1 h or 10 h of cell time per second of real time.

## Electrolysis

A DC supply at voltage V drives a current only above the decomposition voltage E_min:

  I = (V − E_min) / (R + R_MT / [Cu²⁺])  for V > E_min, else 0

| Cell | Cathode | Anode | E_min (V) | R (Ω) |
|---|---|---|---|---|
| Copper plating, CuSO₄ 0.50 M, Cu electrodes | Cu²⁺ + 2e⁻ → Cu | Cu → Cu²⁺ + 2e⁻ | 0 | 2 |
| Silver plating, AgNO₃ 0.10 M, Ag anode, steel spoon | Ag⁺ + e⁻ → Ag | Ag → Ag⁺ + e⁻ | 0 | 2 |
| CuCl₂ 0.50 M, graphite | Cu²⁺ + 2e⁻ → Cu | 2Cl⁻ → Cl₂ + 2e⁻ | 1.358 − 0.3419 = 1.016 | 2 |
| Water, Na₂SO₄ 0.50 M, platinum | 4H₂O + 4e⁻ → 2H₂ + 4OH⁻ | 2H₂O → O₂ + 4H⁺ + 4e⁻ | 1.229 | 10 |

The mass-transport term applies only to CuCl₂, where Cu²⁺ is used up. Its E_min follows the
Nernst equation as [Cu²⁺] falls ([Cl⁻] = 2[Cu²⁺], P(Cl₂) = 1 atm). In the plating cells the
anode replaces the cation, so the solution doesn't change. Overpotentials are ignored, so the
water threshold is 1.229 V rather than the ~1.8 V a real cell needs.

Faraday's law: Q = ∫I dt, n(e⁻) = Q / F, and each product forms at n(e⁻) / z mol (z electrons
per atom or molecule). Gases are collected at 25 °C and 1 atm, where V_m = RT / P = 24.47 L/mol.
The run stops when a 50 mL tube is full or a dissolving anode is used up. Worked values the
tests check: 2.00 A for 30.0 min plates 1.19 g Cu; 500 C gives 63.4 mL H₂ and 31.7 mL O₂.

Time is scaled: 10 s, 1 min or 10 min of run time per second of real time.
