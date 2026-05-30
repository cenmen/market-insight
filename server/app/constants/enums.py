from enum import Enum, IntEnum


class PeriodEnum(str, Enum):
     Daily = "daily"
     Weekly = "weekly"
     Monthly = "monthly"


class StrategyEnum(IntEnum):
     InvertedHammerNextDayExitV1 = 1


class TradeTypeEnum(IntEnum):
     Buy = 1
     Sell = 2
