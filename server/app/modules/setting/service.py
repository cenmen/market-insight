from __future__ import annotations

from typing import Any

ETF_TRACKING_CONFIGS: list[dict[str, Any]] = [
    {
        "code": "588200",
        "name": "科创芯片ETF嘉实",
        "indexCode": "881121",
        "indexName": "半导体",
        "key": "chip",
        "active": True,
    },
    {
        "code": "515880",
        "name": "通信ETF国泰",
        "indexCode": "931160",
        "indexName": "通信",
        "key": "communication",
        "active": True,
    },
    {
        "code": "159516",
        "name": "半导体设备ETF国泰",
        "indexCode": "931743",
        "indexName": "半导体设备",
        "key": "semiconductorEquipment",
        "active": True,
    },
    {"code": "159819", "name": "人工智能ETF易方达", "indexCode": None, "indexName": "人工智能", "key": "ai", "active": False},
    {"code": "562500", "name": "机器人ETF华夏", "indexCode": None, "indexName": "机器人", "key": "robot", "active": False},
    {"code": "159206", "name": "卫星ETF永赢", "indexCode": None, "indexName": "卫星", "key": "satellite", "active": False},
    {"code": "516160", "name": "新能源ETF南方", "indexCode": None, "indexName": "新能源", "key": "newEnergy", "active": False},
    {"code": "159755", "name": "电池ETF广发", "indexCode": None, "indexName": "电池", "key": "battery", "active": False},
    {"code": "515790", "name": "光伏ETF华泰柏瑞", "indexCode": None, "indexName": "光伏", "key": "solar", "active": False},
    {"code": "512400", "name": "有色金属ETF南方", "indexCode": None, "indexName": "有色", "key": "nonFerrous", "active": False},
    {"code": "159326", "name": "电网设备ETF华夏", "indexCode": None, "indexName": "电网设备", "key": "powerGrid", "active": False},
    {"code": "159870", "name": "化工ETF鹏华", "indexCode": None, "indexName": "化工", "key": "chemical", "active": False},
    {"code": "159865", "name": "养殖ETF国泰", "indexCode": None, "indexName": "养殖", "key": "breeding", "active": False},
    {"code": "159825", "name": "农业ETF富国", "indexCode": None, "indexName": "农业", "key": "agriculture", "active": False},
    {"code": "515220", "name": "煤炭ETF国泰", "indexCode": None, "indexName": "煤炭", "key": "coal", "active": False},
    {"code": "516150", "name": "稀土ETF嘉实", "indexCode": None, "indexName": "稀土", "key": "rareEarth", "active": False},
    {"code": "159732", "name": "消费电子ETF华夏", "indexCode": None, "indexName": "消费电子", "key": "consumerElectronics", "active": False},
    {"code": "510880", "name": "红利ETF华泰柏瑞", "indexCode": None, "indexName": "红利", "key": "dividend", "active": False},
    {"code": "512880", "name": "证券ETF国泰", "indexCode": None, "indexName": "证券", "key": "brokerage", "active": False},
    {"code": "512800", "name": "银行ETF华宝", "indexCode": None, "indexName": "银行", "key": "bank", "active": False},
    {"code": "562510", "name": "旅游ETF华夏", "indexCode": None, "indexName": "旅游", "key": "tourism", "active": False},
    {"code": "159928", "name": "消费ETF汇添富", "indexCode": None, "indexName": "消费", "key": "consumer", "active": False},
    {"code": "512690", "name": "酒ETF鹏华", "indexCode": None, "indexName": "白酒", "key": "liquor", "active": False},
    {"code": "512200", "name": "房地产ETF南方", "indexCode": None, "indexName": "房地产", "key": "realEstate", "active": False},
    {"code": "159745", "name": "建材ETF国泰", "indexCode": None, "indexName": "建筑材料", "key": "buildingMaterials", "active": False},
    {"code": "512170", "name": "医疗ETF华宝", "indexCode": None, "indexName": "医疗", "key": "healthcare", "active": False},
]


def get_etf_tracking_configs() -> list[dict[str, Any]]:
    """返回 ETF 跟踪配置列表。"""
    return [dict(item) for item in ETF_TRACKING_CONFIGS]


def get_active_etf_tracking_configs() -> list[dict[str, Any]]:
    """返回当前启用的 ETF 跟踪配置列表。"""
    return [dict(item) for item in ETF_TRACKING_CONFIGS if item.get("active") is True]


def get_theme_config_map() -> dict[str, dict[str, Any]]:
    """返回按主题 key 索引的配置映射。"""
    return {item["key"]: dict(item) for item in ETF_TRACKING_CONFIGS}


def get_setting_payload() -> dict[str, Any]:
    """返回供前端与 skill 复用的设置数据。"""
    etf_tracking = get_etf_tracking_configs()
    active_etf_tracking = [dict(item) for item in etf_tracking if item.get("active") is True]
    return {
        "etfTracking": etf_tracking,
        "activeEtfTracking": active_etf_tracking,
        "activeThemeKeys": [item["key"] for item in active_etf_tracking],
    }
