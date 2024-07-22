export enum PortkeyVersion {
  v1 = 'v1',
  v2 = 'v2',
}

export enum PortkeyNameVersion {
  v1 = 'portkey',
  v2 = 'Portkey',
}

export const ConnectWalletError =
  'Failed to connect wallet. Please check your internet connection and ensure your wallet is up-to-date.';

export const LoginExpiredTip = 'Login expired, please log in again';

export const NetworkNotMatchTipPrefix = 'Please switch Portkey to aelf';

export const ETRANSFER_LOGO_BASE64 =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAgEASABIAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAA4ADkDAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD+/igD8/f+Cjf7celfsL/A2HxxZ2OieJPid4v1u38OfDPwXrdzcRWesXUElvd+Jda1KLT54NTbQfDWiuZb2e0kiB1jUvD2lS3VodYinX+kvov/AEf8Z9IPxAnw/XxGPyvhPJcBVzTivPsBSpTr4GjUjVo5VgcLPE06mEWY5rj48lCnWjNrBYXM8ZClWWCnTf594j8c0uBMiWOhChic0xleOGyzBV5SUK04uM8TWqKnKNX2GGoO85Qa/fVMPScoe2Uj8DW/4OHv2ndp2/BT4DhsHaWg+ILKGxwSo8aqWAPJAZSRwGHWv9GF+zN8Jrq/HviI1dXSqcNJtdUm8haTts7O3Z7H4D/xMTxP0yTIb9NMwf4fXV+aM3/iIZ/a2/6JF+zp/wCCP4l//POrr/4poeDP/RaeJ3/hw4V/+hMz/wCJiOLv+hPw5/4IzP8A+egf8RDP7W3/AESL9nT/AMEfxL/+edR/xTQ8Gf8AotPE7/w4cK//AEJh/wATEcXf9Cfhz/wRmf8A89D9ev8Aglt/wU+1H9uO5+IngT4q6L4H8FfFvwmLTxH4e0jwcNYstK8U+BZ1hsdRurOy8Qa3r9++q+GtZMK6yyagsEljr+jPbWam21CY/wAU/S6+iXhvo/0uGeIuD8fxBn3BmcutleZ43PHga+MyjiGm54jDUa9fLcBl2Gjg81wPO8CpYZ1I4jLsdGrXaq4aB+v+FnihU45lmOAzWhgcDm+E5MTh6OD9tClisDJKFScIYiviKjq4atb2zVTldPEUXGC5ajP2Mr+ID9kCgCvdXVrY2tzfX1zb2dlZ2811eXl1NHb2tra28bTXFzc3EzJFBbwRI8s00rrHFGrO7KqkjSjRrYitSw+HpVK9evUhRoUKMJVa1atVkoU6VKnBSnUqVJyjCEIRcpyajFNtImc404ynOUYQhFznObUYwjFNylKTaUYxSbbbSSTbdj+Bb/gpZ+2Nc/tmftMeI/GWj3d2fhX4NEngv4SadcCaEDwzp8x+2+JZrSSQiHUPGWqrPrc2YoLmDS30bSrtXl0rzG/6Nfoq+B9LwM8KcryPG0aP+uGeOOe8Z4qm4Tf9q4mH7jKoVoxTqYbI8G6eAhadSlUxccdjKLjDGcq/gLxM4ylxnxNicbRnP+ysFfBZRTleP+zU37+JcG/dqYyqpV3pGUaTo0ppuld+Bfsp/Dr4Y/FH48+APCnxp+IPh/4YfCVtUOq/ELxb4i1aLR7eHw1pETX15o+n3DyJO+s+JJIoPD+m/Y1lns5tS/tWSMWen3csf6P4w8T8WcI+HXEmccCcNZlxbxmsIsHw1k2WYKeOqzzXGzWHoY3E0oxlTWByuM6mZYr27hTrwwv1OMvb4mjCfgcJ5dlea5/l+EzrMMPleUOr7XMcXiayoxWGop1J0acm1J1sS1HD0uS8oSqe1a5Kc2v7ELH42/8ABGXTYVt7DU/2HrSFVjQJB4H+GqbhGgRDIw8NbpXCgDfIzOerMSSa/wARcRwF9OfFVHVxOE8f6025S5qnEHFUrOcnKXKnmtoJt35YpRXRJH9jU888GKUVGnV4GhFJK0cDli2Vld/Vrt26u78z7Y/4Za/ZX1rTP+Tc/gbJYatYf9Eh8E2M0lnf2/8A2L1te2crQy/9O91buf8AllMny/gv/EXfF/A4v/k5/iBHE4PEf9Frn+Ipxr4er/2M6uHrwVSH/TyjUj/PCWv23+q3Ctel/wAk5kTp1qf/AEKMFTk4VI/9g8Zwbi/7s4vs0fxtfHPwJ8Sf+CTP/BQSw1/wKlydD8L+IV8f/Cya+uHms/Gvwg8R3OoadeeE9Yu/mlmk/ss634D8RTukN8l9ZvrtiluZtKuz/uN4fcQ8LfTK+jZicu4hlSWYZtlj4b4vp4enGFfIeNsrpYbE0M5wNHSFOP1tYDiLLKcXPDyw9eOX4iVVU8ZRP40z3AZl4S+IVPEYBS9hhcR/aGVOcm4Y3J8TKpTnhK095P2Xt8BiZNKaqQdeCjelM/tk+EPxV8G/HH4Y+B/i58PtSGq+DviB4dsPEeh3ZCrOlveR/v7C/hV3+y6rpN4lzpWr2LMZLDVLK8spcSwOB/grxrwfnnh/xZxBwXxLhXg884bzPE5XmFHV05VKEv3eJw82o+2weMoSpYzBYhJQxGEr0K8PcqRP7byfNcFnmV4HN8vqe1weYYaniaE9pKM171Oorvkq0pqVKtB606sJwesWej18uekfg/8A8Fyv20P+FNfBez/Zq8D6mYfiN8dNPnfxXd2VzJDe+FvhVaXkcWoKTGBsufH15DceG4VLuG0C08UrLHDLPp07f6H/ALP3wJ/1547r+KnEGEVThjw9xNOOT0a9KM6Gb8YVqE54ZpSbvS4coTpZpN8qazGtlDhKcKeJpr8G8dONf7FyWHDOBq8uZZ7Tk8XOEmp4XKoTSqbbSzCcZYaOr/2eGKuouVOR/HTX+3x/G4UAfrv/AMEcf2Mk/ai/aSh8c+MNNjvPhD8BJtH8YeKoLoIbbxH4uuJbuXwF4SMMiSLd2k+paXda9r0TRS20mjaHLpN40Da7ZO/8V/Th8dH4SeFtTh/JMVKhxr4jQx2SZPUpOSq5XktKFGHEecqcXF0a1PC4yll2XTU4VY47MIYygqiy+vGP6/4N8FriniWOOxlJTyfIJUcZi4yty4nFyc3gMJZpqcJVKUsRiFZxdGg6U+V14N/tt/wUs/4Kpy/sjfHz4HfCb4erZ+IZ9A8QaZ44/aK02IW9xd/8IDqtpJY6f4BtGlBjsPEer6Pqd341gneW3n02aw8E3Uq3ek6ze20v8EfRW+iBDxo8OfEDjLiV18sp5lluLyDwxxU3UpUf9Y8HWjiMTxHWUPexGV4LG4SjkNSnGFWniqeJz+lB0cZgaFWH7f4meKz4Qz/Ispy7kxEsPiKWO4jpLllP+z6sHCngIN6U8TWo1Z42Mm4ypSp4KT56VacXb/4LLfDD4NftDfsK6f8AtGWPinwzbah8Prbw34++FHjh33R+MvDfj1tMtZvBen3EMctzcR+MLS/0vWNKgSB/K1nRbB7qTT9NOr3cWH0GuLOOfDT6QmJ8MMRlGbVcNxLVzThzjHh+MbSyPNOHFi60M+xNKpOFKlLJK2HxeCxlR1Fz4HH4mNGOJxSwVGd+M2V5NxFwJT4jp4rCxqZfHDZhlOObusZhsf7KDwVOUU5SWMhUpVqUVF2rUKbk6dP2018K/wDBBL9s86F4i1z9jTx5qzDSfFUup+NPgrNezM0Vh4mt7Z73xn4Jt3cv5Fvr+m20nizSLVfs1lDqul+JiPO1TxHBHL/Qv7RbwKWYZZl/jnw7gl9dyeGEyLjynQglPEZVUqxw+RZ/VjFR9pUy7FVY5Njaz9rXng8ZlS9zCZXUlD4PwD409hia/BmPrfucU6uNySU27U8VGLnjcDFu/LHEU4vF0YLlgqtLFb1cTFP+qiv8fz+rD+A3/gqVp/xm0/8Abo+PI+OFx9t8SXniVL7wxfW1rNZ6HdfDOa1iT4df8I5BK0ix6XZ+F4rHTblY57qVNestaj1K8vNaTU7mX/o6+iLieBcT9Hzw7fAFL2GVUMqlh82w9WrCvmFLiuFacuJ/7UqQUXLF182niMVScqdGEsur4CWFoUMBLCUofwB4p086p8d59/bkufEzxKnhZxi4UJZY4JZd9Wi20qUMKqdOSUpNYiFZVZzrKrJ8d+zB+wt8Zv2rfh78eviJ8ObDfpfwQ8GnXo4ZraaR/G/ieO5tL6bwLoEiFVbWx4Qh1/XowguXa/tdA0WS3iPiWC/s/c8WvpB8DeDvEvh1wxxRiOXGcf55/Z0pwqwjHIMplSrYeHEOYxabWAedTy7LpOTpRWHrZjj41Z/2VUw1fj4X4EzrizLs/wAxy2nelkeC+sKLi28dilKE3gMO9F7f6msRiFbmbqQw9FxX1mNSHyd4P8JeIfHvivw14H8JaXda34p8X69pPhnw7o9lE013qet65fQabpljbxoGZ5bm8uYYlABwWyeATX7Hnec5Zw7k+a5/nWLo4DKMky7GZrmeOxE1CjhMBl+HqYrF4irOTSUKVClObu+llqfJYPCYjH4vDYHCUp18VjMRRwuGowTc6tevUjTpU4patynJJep+g3xS/Zz/AG7v+CV3xD0r4iQX+teA0urlNH0L4ufDTWm1fwF4qEqpqbeGNbWW3jinjmexaafwh480C3h1KXSpb6ysNSs7KDUK/mzhHxP+jx9L7hnGcM1MNgOIpUqUsbmPBfFWBWC4iyhwcsIs2wDhUlOnKnHEKFPOuHcxqVMLDGQw9fEYWvXqYY/Qs14c488KsxpZjGpXwClJUaGb5ZW9tgMVdKq8LXvFKSk6fNLB4/DxVR0nUhTqQhGofB3xK+I/jP4vePfFnxN+Iet3PiPxr421q81/xFrN0I0kvNQvHy3lwwrHBaWltEsVpYWNtHFaWFjBb2drFFbwRRr/AEPwrwvkXBXDmTcJ8M4ClleQ5BgKGXZZgaLlKNDDUI2XNUm5VK1arNzrYjEVZTrYjEVKtetOdWpOT+CzPMsbnGYYvNMxryxONx1eeIxNadk51JvpFJRhCKtCnCKUKcIxhBKMUl6l4r/al+MHjP8AZ0+Gn7LuueIDP8KPhV4s8S+LvDemJ563U994g+a2tdVma4eK8sfDU994ln8ORiCKSx/4SzWoXkntxp8Vl8jk/hFwTkXidxX4uZflqp8Y8YZNlWS5pi37N0qeHy3SrWwcFTjOhiM1p4fKqeaSdSccR/Y2AqRjTqPEzr+ri+Ks4xvDmWcLV8RzZTlWLxOMw1Jc3NKeI1jCq3JqdPDSniZYZcqdP63Wi3KPs1DJ/Zl8IfFrx5+0D8IfC3wJmu7T4u6h460K48B6lZTC3k0TWtIul1lfEU9wQywaf4ctdPudd1Wd0kji0zTruSSKWNWjbt8V874M4d8NuNc38QoUa3BeG4ezCnxFha8PaRx+AxtF4F5ZTpqzqYnNK2JpZfg6cZRlPF4mjGM4SakseGMHm+P4gyfC5C5wzepj6EsBVg+V0K9GXtliZSekaeGjTlXqyaaVKnNtNJp/6I/9k/Eb/odfC/8A4QV9/wDNzX/Mr9c4X/6EObf+JHh//ofP9FPY5n/0HYX/AMN8/wD5vPx+/wCC3X7GTfHr4Cw/HnwTpE178UvgDY3l9f22nwGa98S/Cq4mW68UWDxxr5lxN4PkD+L9Py5Fvp0fiuGGGa61OEL/AGz9AXx0Xh14iz8O8/xsKHCPiPiKGHw9XE1OShlXGFKm6OU4lSk+SnTzuPLkmJ929XFSyepUqU6OEm3+P+OHBf8Ab+QRz/A0ZTzXh+E51I043nicqlLnxVOyV5SwbvjKevu01i0lKVRHy3/wb/8A7V3h99A8a/sgeIYtC0bxBbalqfxQ+HN7Bb2un3/jKG+gtoPG2kajKixHWNd0CHT9L1TTJ5TdapP4a/tC2Zk0nwnapD+u/tIfB3Mo5jkPjZlk8wx2W1cLheEuKMPUq1cThsjqYepVqZDjcLCTmsDl+ZVMTi8Ji6cPY4Snmv1aqlLG5zWlP5X6P3FmHeHxvB+IVCjiI1auaZbUjGNOpjYzjGONo1GkvbV8PGnSq0pPmqyw3tI6UsJFL7p+An/BKzwB8FP29Pip+1NaQaFN4BvbEa78GfA8NsSPA3j3xm1yPHt8Ld0S2tLbQvJvk8F29ojWVhpnjNrW2itrrw1ZzV/PfiL9L/iTjz6OvB/hFWqZhDiOhiHl/HXEE6tnxBw7kSpPh3DuqpSq1quYc+HlntStJV8Ti8iVarOrRzWvA+7yDwpy/JOPs14qhGhLL5w9vkuBUf8AccfjXL6/U5WlGEaFqiwUYJwp0sbyxUZ4aEj8Sf8Agt/+2gfjn8dIf2evBOr/AGj4X/ATUby010WzI9r4g+MSfbNN8RXzSoxE8Hg2ylk8JaerBWttUfxa4eWC+g8r+9/oB+BS8PvD6fiXn+C9lxb4jYWhWy72qkq2W8ES9hissw6hJL2dTPK8I5ziWm1Vwkcmi4wqYepz/iPjjxp/buex4dwNbmyvIKk4V+VpwxGcrnpYmd18UcHBvCU1vGq8W7uM42/Dev8AQI/CwoA/rE/4INfsW/8ACH+CdX/bB8faUE8R/EG2uvDPwftb23kjudH8D2t1Pa+JPFipMAUm8ZalbrpulSiKN08P6PPeW9xc6f4oXZ/jf+0R8dv7bz7BeCXDmMcsr4aq0c142q0KsZUsdxBVo06uV5M3TbUqeR4Wq8VjIOcoyzLHU6FWnSxOUPm/rPwF4K+p4KtxjmFK2JzCM8Lk8ZxalRwMZyjicXaW0sZViqVJ2TWHoynGUqeKVv6Mq/zCP6OIp4IbqGa2uYYri3uIpILi3njSWGeGVDHLDNFIGjliljZkkjdWR0YqwIJFXTqVKVSFWlOdKrSnGpTqU5ShUp1ISUoThOLUoThJKUZRalGSTTTQpRjKMoyipRknGUZJOMotWcZJ6NNaNPRrRn8N/wC3B8DfHP8AwTG/bp0fx58HhNoHhR9fh+LPwH1RxLd6fFpRufL8QeA74yOxu7bQLu5vvC2qabc3Mt1f+D9S0i6v5M63k/8AQF4AeIHD/wBLH6PeO4d43dPMs4jl0+DfETCR5KOJnjPZc2W8RYdRSVGrmVGlh83wmKpUoUcNneFxtLDR/wBgP4Z45yLHeGHHdHH5PfD4R4hZvkNV3nTVLmtiMBUu3zxw85VMLVpyk51MHUozm/35/TP4E/4K4/sHeK/BfhXxLrnx48M+Ctb13QNK1PWfB+uWfiVtX8L6rd2cU2o6DqElroMtrPc6VeNNZPdWkstrdeSLm2keCWNj/lJxD9C/6RGT57nGVZf4d5tn2Ay/MsZhMDneX18qWCzbB0a84YXMcNGtmMK1OljKCp140q0IVqPP7KrGNSEkv6bwHi7wFi8FhMTXz7C4GvXw9KrWwdeGJ9thas4J1MPUcaDhKVKfNByg3CfLzRbi0zjrn9tP/gkDcXE9/deM/wBmm5vJppby5u5fhRHcXc9zI7TTXEkp8BPPPcyys0ryEvNJKxYlnbJ9yl4EfTYp0qeGo5F4q0qFOnChSow4xlTo06UYqnClCC4ijTp0oQShGKUYQgkrKKOOXGvg/KUqksbwzKcm5ym8qUpyk3zOTf1BylJvVvVt67n8rv8AwUc/aZ8H/tN/tKeJPEHws0LRPDfwc8GxDwZ8M7LQfD9l4bt9X0nTppG1Lxne6faWGmyG/wDF2qvcajA1/aRajaeH00HSb1RPpjZ/18+i/wCFOd+E/hZleW8X5jj8044zyf8AbvFeIzHMq+aVMFjcTCKwuRUMTWxOKj9XyXBqnhqiw1aeFrZlLMcbQbp4tH8qeJHE+D4n4lxOIyqhQw2TYJfUsshh8PDDRrUqbbq42dOFOk/aYyq5VI+0gqkMOsPRmuakzj/2Ef2UNb/bJ/aR8E/CCzXULXwp53/CTfE7X9PVVm8OfDrRbm1Ov3kNxJBc29rqeptcWnh3QJrm2ubdNf1nTGuLea2Wda9z6Q/jHgPA3wtz7jau8NWzj2f9lcJ5biW3DNOJ8fSqrLaFSlCpSqVsJhFSrZnmMKVWlUeW4HFqlVhVdNnHwHwnX4z4kwOTw9pHCc31rNMRT+LDZdQlD6xOMnGUYVarlDDYdyjKKxFak5RcVJH+gv4b8OaH4P8AD2heE/DGl2mieG/DOj6boGgaNYR+TY6Vo2kWcNhpmnWkWT5dtZ2dvDbwqSSI41BJOSf+bDNM0zDO8zzDOc2xdbH5pm2NxWZZjjsTLnxGMx2NrzxOLxVaenNVr16k6s3ZJyk7JLQ/0Iw2GoYPD0MJhaUKGGwtGnh8PRpq0KVGjBU6VOC6RhCMYryRtVwG4UAfDX7fn7D3hD9uv4N2vw61nW4fBXi/w3r9p4j8BfEP+wx4guPDF4WjtdesZdMTVNEm1HR/Eei+bZX2njV7SEajb6JrMi3M+h2sDf0D9HHx/wA7+j1xxW4nwOAqZ9kmaZdWyviPhn+0P7NpZtQSlWy7EQxcsJj6eFxuV4/kr4fEvBVqn1apj8DF0qeYVqi+F8QOBsHx3k0curV1gsZhsRDE4DMfYfWJYWd1DEQdJVaEqlHE0LwqU/bQXtI0Kz5pUIxf4twf8G4epNIBdftf2MMWDl4PgRPcybv4QIpPjBaqQe580Edlav7tqftQ8Ko3peCeInO692p4h06UbdXzx4JrO66Lk17o/FY/Rvqt+9xhTS7xyGUn9zziC/Evf8Q3/wD1eV/5rx/+PKuf/iqL/wBWN/8AOmf/AJPjT/iW7/qs/wDzXf8A8Oh/xDf/APV5X/mvH/48qP8AiqL/ANWN/wDOmf8A5Pg/4lu/6rP/AM13/wDDp+tv/BPj/gnj4E/YH8IeM9L0rxU3xK8dePdZtrzxD8Qr3wzF4Xu20LS7VIdE8K2Gkx634iFlpen3kuq6pNINTkn1G+1Rmuy0NhpsVr/GX0lPpMcQ/SMzvIsXjMoXCvD/AA7gatDLeGqGazzeisxxdaU8fnGJxssBljr4vE0YYPCQi8JGnhcPhEqNp4nFTrfrnh74d4DgDB42lSxTzPH4+tGeIzGeGWFn7ClFKhhKdJV8RyUqc3VqyftXKpUq3npTpqP6HV/Mx+iBQAD/2Q==';
